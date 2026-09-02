import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  MEDIA_BUCKET,
} from '@/lib/supabase/config';
import type { getBrowserClient } from '@/lib/supabase/client';
import type { MediaRow } from '@/lib/types/database';

type Client = NonNullable<ReturnType<typeof getBrowserClient>>;

export type UploadResult =
  | { ok: true; media: MediaRow }
  | { ok: false; error: string };

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
    return `${file.name}：只接受 jpg / jpeg / png / webp`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `${file.name}：超過 10MB 上限`;
  }
  return null;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 上傳一張圖片到 Supabase Storage 的 media bucket，
 * 並在 media 資料表建立索引紀錄。
 *
 * 新圖片一律存 Supabase Storage，不再寫進 public/images。
 * 舊的 /images/... 路徑仍然可以正常讀取。
 */
export async function uploadImage(
  supabase: Client,
  file: File,
): Promise<UploadResult> {
  const invalid = validateImage(file);
  if (invalid) return { ok: false, error: invalid };

  const stamp = new Date().toISOString().slice(0, 10);
  const unique = Math.random().toString(36).slice(2, 8);
  const path = `${stamp}/${slugify(file.name)}-${unique}.${extensionOf(file)}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false });

  if (uploadError) return { ok: false, error: uploadError.message };

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
    })
    .select()
    .single();

  if (error || !data) {
    // 資料表寫入失敗時，把已上傳的檔案清掉，避免產生孤兒檔案
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    return { ok: false, error: error?.message ?? '無法建立媒體紀錄' };
  }

  return { ok: true, media: data };
}

/** 從 Storage 與 media 資料表同時刪除。 */
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
