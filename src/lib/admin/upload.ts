import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  MEDIA_BUCKET,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from '@/lib/supabase/config';
import type { getBrowserClient } from '@/lib/supabase/client';
import type { MediaRow } from '@/lib/types/database';

type Client = NonNullable<ReturnType<typeof getBrowserClient>>;

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export type UploadItem = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number; // 0–100
  error?: string;
  media?: MediaRow;
  previewUrl: string;
};

/** 一次最多處理的張數 */
export const MAX_BATCH = 20;

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';

const extensionOf = (file: File) => {
  const fromName = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
  if (fromName) return fromName === 'jpeg' ? 'jpg' : fromName;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
};

export function validateImage(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return '只接受 jpg / jpeg / png / webp';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return '超過 10MB 上限';
  }
  return null;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 上傳前先在瀏覽器讀出原始尺寸，之後才能做「不裁切」的版面 */
export function readDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/**
 * 用 XHR 直接打 Supabase Storage 的 REST endpoint，
 * 因為 supabase-js 的 upload() 不提供上傳進度。
 */
function putToStorage(
  path: string,
  file: File,
  accessToken: string,
  onProgress: (percent: number) => void,
): Promise<string | null> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${path}`,
      true,
    );
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY ?? '');
    xhr.setRequestHeader('x-upsert', 'false');
    if (file.type) xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(null);
      } else {
        let message = `上傳失敗（HTTP ${xhr.status}）`;
        try {
          const body = JSON.parse(xhr.responseText);
          message = body.message || body.error || message;
        } catch {
          // 回應不是 JSON 就沿用預設訊息
        }
        resolve(message);
      }
    };

    xhr.onerror = () => resolve('網路錯誤，上傳中斷');
    xhr.onabort = () => resolve('上傳已取消');
    xhr.send(file);
  });
}

/**
 * 上傳單張圖片並在 media 表建立紀錄。
 * 單張失敗只回傳該張的錯誤，不影響同批其他圖片。
 */
export async function uploadOne(
  supabase: Client,
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ ok: true; media: MediaRow } | { ok: false; error: string }> {
  const invalid = validateImage(file);
  if (invalid) return { ok: false, error: invalid };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, error: '登入狀態已失效，請重新登入' };
  }

  const dimensions = await readDimensions(file);

  const stamp = new Date().toISOString().slice(0, 10);
  const unique = Math.random().toString(36).slice(2, 8);
  const path = `${stamp}/${slugify(file.name)}-${unique}.${extensionOf(file)}`;

  const uploadError = await putToStorage(
    path,
    file,
    session.access_token,
    onProgress,
  );
  if (uploadError) return { ok: false, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from('media')
    .insert({
      file_name: file.name,
      storage_path: path,
      public_url: publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      width: dimensions?.width ?? null,
      height: dimensions?.height ?? null,
      aspect_ratio:
        dimensions && dimensions.height > 0
          ? Number((dimensions.width / dimensions.height).toFixed(6))
          : null,
      alt: null,
      caption: null,
      focal_x: 0.5,
      focal_y: 0.5,
    })
    .select()
    .single();

  if (error || !data) {
    // 資料表寫入失敗時清掉已上傳的檔案，避免孤兒檔案
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    return { ok: false, error: error?.message ?? '無法建立媒體紀錄' };
  }

  return { ok: true, media: data };
}

/** 從 Storage 與 media 資料表同時刪除 */
export async function deleteImage(
  supabase: Client,
  media: Pick<MediaRow, 'id' | 'storage_path'>,
): Promise<string | null> {
  const { error: storageError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([media.storage_path]);

  if (storageError) return storageError.message;

  const { error } = await supabase.from('media').delete().eq('id', media.id);
  return error?.message ?? null;
}
