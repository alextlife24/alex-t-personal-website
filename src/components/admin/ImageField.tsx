'use client';

import { ImageIcon, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '@/components/admin/Toast';
import { getBrowserClient } from '@/lib/supabase/client';
import { uploadOne } from '@/lib/admin/upload';
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/supabase/config';
import { cn } from '@/lib/utils';

type ImageFieldProps = {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  /** 上傳成功時額外回報原始尺寸，呼叫端可一併存進資料庫 */
  onMeta?: (meta: { width: number | null; height: number | null }) => void;
  hint?: string;
  className?: string;
};

/**
 * 圖片欄位：Upload / Replace / Remove。
 * 上傳目標為 Supabase Storage，舊的 /images/... 路徑仍可正常顯示。
 */
export default function ImageField({
  label,
  value,
  onChange,
  onMeta,
  hint,
  className,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const supabase = getBrowserClient();
    if (!supabase) {
      toast('尚未設定 Supabase，無法上傳圖片。', 'error');
      return;
    }

    setBusy(true);
    const result = await uploadOne(supabase, file, () => {});
    setBusy(false);

    if (!result.ok) {
      toast(result.error, 'error');
      return;
    }
    onChange(result.media.public_url);
    onMeta?.({ width: result.media.width, height: result.media.height });
    toast('Image uploaded.');
  };

  return (
    <div className={className}>
      <span className="label-text block text-ink/45">{label}</span>
      {hint && <span className="mt-1 block font-sans text-xs text-ink/35">{hint}</span>}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative aspect-[4/5] w-full max-w-[10rem] shrink-0 overflow-hidden border border-ink/15 bg-sand">
          {value ? (
            // 圖片可能來自 Supabase Storage（外部網域），
            // 這裡用原生 img 以免需要為每個專案設定 remotePatterns。
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-ink/30">
              <ImageIcon aria-hidden strokeWidth={1.25} className="h-5 w-5" />
              <span className="label-text">NO IMAGE</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_EXTENSIONS}
            className="hidden"
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'inline-flex items-center gap-2 border border-ink/20 px-4 py-2 font-sans text-sm text-ink',
              'transition-colors duration-300 hover:border-coffee hover:text-coffee disabled:opacity-50',
            )}
          >
            <Upload aria-hidden strokeWidth={1.5} className="h-4 w-4" />
            {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2 font-sans text-sm text-ink/70 transition-colors duration-300 hover:border-red-800/40 hover:text-red-800"
            >
              <Trash2 aria-hidden strokeWidth={1.5} className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
