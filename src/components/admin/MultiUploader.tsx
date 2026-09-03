'use client';

import { AlertCircle, Check, Plus, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/supabase/config';
import { MAX_BATCH, uploadOne, type UploadItem } from '@/lib/admin/upload';
import type { MediaRow } from '@/lib/types/database';
import { cn } from '@/lib/utils';

type MultiUploaderProps = {
  /** 每張上傳成功後回呼，方便呼叫端即時累加 */
  onUploaded: (media: MediaRow) => void;
  label?: string;
  hint?: string;
};

/**
 * 多圖上傳。
 *
 * - 一次最多 20 張，不限制照片比例
 * - 每張獨立顯示 Uploading / Completed / Failed 與百分比
 * - 單張失敗不會中斷其他張
 */
export default function MultiUploader({
  onUploaded,
  label = 'Upload Images',
  hint = 'jpg / png / webp，單張最大 10MB，一次最多 20 張',
}: MultiUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const patch = useCallback((id: string, next: Partial<UploadItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...next } : item)),
    );
  }, []);

  const run = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).slice(0, MAX_BATCH);
      if (files.length === 0) return;

      const supabase = getBrowserClient();
      if (!supabase) return;

      const queued: UploadItem[] = files.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        status: 'pending',
        progress: 0,
        previewUrl: URL.createObjectURL(file),
      }));

      setItems((current) => [...current, ...queued]);
      setBusy(true);

      // 逐張上傳，避免同時打太多請求把瀏覽器連線數吃滿
      for (const item of queued) {
        patch(item.id, { status: 'uploading', progress: 0 });

        const result = await uploadOne(supabase, item.file, (percent) =>
          patch(item.id, { progress: percent }),
        );

        if (result.ok) {
          patch(item.id, { status: 'completed', progress: 100, media: result.media });
          onUploaded(result.media);
        } else {
          patch(item.id, { status: 'failed', error: result.error });
        }
      }

      setBusy(false);
    },
    [onUploaded, patch],
  );

  const clearFinished = () => {
    setItems((current) => {
      current
        .filter((item) => item.status === 'completed')
        .forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return current.filter((item) => item.status !== 'completed');
    });
  };

  const pending = items.filter((item) => item.status !== 'completed');
  const completedCount = items.filter((item) => item.status === 'completed').length;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_EXTENSIONS}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) void run(event.target.files);
          event.target.value = '';
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) void run(event.dataTransfer.files);
        }}
        className={cn(
          'border border-dashed p-6 text-center transition-colors duration-300',
          dragOver ? 'border-coffee bg-sand' : 'border-ink/20',
        )}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 border border-ink/20 bg-paper px-4 py-2 font-sans text-sm text-ink transition-colors duration-300 hover:border-coffee hover:text-coffee disabled:opacity-50"
        >
          <Plus aria-hidden strokeWidth={1.5} className="h-4 w-4" />
          {busy ? 'Uploading…' : label}
        </button>
        <p className="mt-3 font-sans text-xs text-ink/40">{hint}</p>
        <p className="mt-1 font-sans text-xs text-ink/30">也可以直接把檔案拖進這個區塊</p>
      </div>

      {items.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="label-text text-ink/45">
              {completedCount} / {items.length} 完成
            </p>
            {completedCount > 0 && !busy && (
              <button
                type="button"
                onClick={clearFinished}
                className="font-sans text-xs text-ink/45 underline underline-offset-4 transition-colors hover:text-coffee"
              >
                清除已完成
              </button>
            )}
          </div>

          <ul className="space-y-1.5">
            {(busy ? items : pending).map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 border border-ink/10 bg-paper p-2"
              >
                <span className="h-10 w-10 shrink-0 overflow-hidden bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-xs text-ink">
                    {item.file.name}
                  </span>

                  {item.status === 'uploading' && (
                    <span className="mt-1 block h-0.5 w-full bg-beige">
                      <span
                        className="block h-full bg-coffee transition-[width] duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </span>
                  )}

                  {item.status === 'failed' && (
                    <span className="mt-0.5 block font-sans text-[0.6875rem] text-red-800">
                      {item.error}
                    </span>
                  )}
                </span>

                <span className="shrink-0">
                  {item.status === 'completed' && (
                    <Check aria-hidden strokeWidth={1.5} className="h-4 w-4 text-sage" />
                  )}
                  {item.status === 'failed' && (
                    <AlertCircle
                      aria-hidden
                      strokeWidth={1.5}
                      className="h-4 w-4 text-red-800"
                    />
                  )}
                  {item.status === 'uploading' && (
                    <span className="font-sans text-[0.6875rem] tabular-nums text-ink/50">
                      {item.progress}%
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span className="font-sans text-[0.6875rem] text-ink/30">等待中</span>
                  )}
                </span>

                {(item.status === 'failed' || item.status === 'pending') && !busy && (
                  <button
                    type="button"
                    onClick={() =>
                      setItems((current) => current.filter((i) => i.id !== item.id))
                    }
                    aria-label="移除"
                    className="shrink-0 text-ink/30 transition-colors hover:text-red-800"
                  >
                    <X aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
