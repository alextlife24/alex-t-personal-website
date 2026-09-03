'use client';

import { Check, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import MultiUploader from '@/components/admin/MultiUploader';
import { useToast } from '@/components/admin/Toast';
import { getBrowserClient } from '@/lib/supabase/client';
import type { MediaRow } from '@/lib/types/database';
import { cn } from '@/lib/utils';

type MediaPickerProps = {
  open: boolean;
  /** single：選一張就關閉；multiple：可複選後按確認 */
  mode: 'single' | 'multiple';
  onClose: () => void;
  onSelect: (media: MediaRow[]) => void;
  title?: string;
};

/**
 * 媒體選取器。
 * 上方可直接多圖上傳，下方是媒體庫縮圖，兩者共用同一份清單。
 */
export default function MediaPicker({
  open,
  mode,
  onClose,
  onSelect,
  title = 'Select Images',
}: MediaPickerProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    const supabase = getBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast(`讀取媒體庫失敗：${error.message}`, 'error');
    else setRows(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (open) {
      setPicked([]);
      void refresh();
    }
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (media: MediaRow) => {
    if (mode === 'single') {
      onSelect([media]);
      onClose();
      return;
    }
    setPicked((current) =>
      current.includes(media.id)
        ? current.filter((id) => id !== media.id)
        : [...current, media.id],
    );
  };

  const confirm = () => {
    // 依照使用者點選的順序回傳
    const ordered = picked
      .map((id) => rows.find((row) => row.id === id))
      .filter((row): row is MediaRow => Boolean(row));
    onSelect(ordered);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col bg-paper shadow-xl sm:h-[80vh]">
        <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="font-serif text-xl text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="-mr-2 p-2 text-ink/50 transition-colors hover:text-coffee"
          >
            <X aria-hidden strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <MultiUploader
            onUploaded={(media) => setRows((current) => [media, ...current])}
            label="Upload New"
          />

          <div className="mt-6">
            <p className="label-text mb-3 text-ink/45">MEDIA LIBRARY</p>

            {loading ? (
              <p className="font-sans text-sm text-ink/40">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="border border-dashed border-ink/15 p-8 text-center font-sans text-sm text-ink/40">
                媒體庫是空的，先從上方上傳圖片。
              </p>
            ) : (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {rows.map((media) => {
                  const index = picked.indexOf(media.id);
                  const selected = index >= 0;
                  return (
                    <li key={media.id}>
                      <button
                        type="button"
                        onClick={() => toggle(media)}
                        className={cn(
                          'group relative block w-full overflow-hidden border transition-colors duration-300',
                          selected
                            ? 'border-coffee ring-1 ring-coffee'
                            : 'border-ink/10 hover:border-coffee/50',
                        )}
                      >
                        <span className="block aspect-square w-full bg-sand">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={media.public_url}
                            alt={media.alt ?? media.file_name}
                            className="h-full w-full object-cover"
                          />
                        </span>

                        {selected && (
                          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-coffee text-[0.625rem] text-paper">
                            {mode === 'multiple' ? index + 1 : <Check className="h-3 w-3" />}
                          </span>
                        )}

                        <span className="block truncate px-2 py-1.5 text-left font-sans text-[0.625rem] text-ink/45">
                          {media.width && media.height
                            ? `${media.width}×${media.height}`
                            : media.file_name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {mode === 'multiple' && (
          <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
            <span className="font-sans text-sm text-ink/50">已選 {picked.length} 張</span>
            <span className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="border border-ink/20 px-4 py-2.5 font-sans text-sm text-ink transition-colors duration-300 hover:border-ink/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={picked.length === 0}
                className="bg-ink px-5 py-2.5 font-sans text-sm text-paper transition-colors duration-300 hover:bg-coffee disabled:opacity-40"
              >
                Add {picked.length > 0 ? picked.length : ''}
              </button>
            </span>
          </footer>
        )}
      </div>
    </div>
  );
}
