'use client';

import { Copy, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { ListHeader } from '@/components/admin/RecordDrawer';
import { useToast } from '@/components/admin/Toast';
import { deleteImage, formatBytes, uploadImage } from '@/lib/admin/media';
import { getBrowserClient } from '@/lib/supabase/client';
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/supabase/config';
import type { MediaRow } from '@/lib/types/database';

export default function AdminMediaPage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaRow | null>(null);

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

    if (error) {
      toast(`讀取失敗：${error.message}`, 'error');
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const supabase = getBrowserClient();
    if (!supabase) {
      toast('尚未設定 Supabase，無法上傳。', 'error');
      return;
    }

    setBusy(true);
    let added = 0;
    for (const file of Array.from(files)) {
      const result = await uploadImage(supabase, file);
      if (!result.ok) {
        toast(result.error, 'error');
        continue;
      }
      added += 1;
    }
    setBusy(false);

    if (added > 0) {
      await refresh();
      toast(`已上傳 ${added} 個檔案。`);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('URL copied.');
    } catch {
      toast('無法複製，請手動選取網址。', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    setBusy(true);
    const error = await deleteImage(supabase, deleteTarget);
    setBusy(false);
    setDeleteTarget(null);

    if (error) {
      toast(`刪除失敗：${error}`, 'error');
      return;
    }
    await refresh();
    toast('Deleted.');
  };

  return (
    <>
      <ListHeader
        title="Media Library"
        description="jpg / jpeg / png / webp，每張最大 10MB"
        actionLabel={busy ? 'Uploading…' : 'Upload Image'}
        onAction={() => inputRef.current?.click()}
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_EXTENSIONS}
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div className="py-8">
        {loading ? (
          <p className="font-sans text-sm text-ink/40">Loading…</p>
        ) : rows.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 border border-dashed border-ink/20 p-12 transition-colors duration-300 hover:border-coffee/50"
          >
            <Plus aria-hidden strokeWidth={1.25} className="h-6 w-6 text-ink/30" />
            <span className="font-sans text-sm text-ink/45">
              媒體庫是空的，點這裡上傳第一張圖片
            </span>
          </button>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {rows.map((row) => (
              <li key={row.id} className="group border border-ink/10 bg-paper">
                <div className="aspect-square w-full overflow-hidden bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.public_url}
                    alt={row.file_name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-3">
                  <p className="truncate font-sans text-sm text-ink" title={row.file_name}>
                    {row.file_name}
                  </p>
                  <p className="mt-1 font-sans text-xs text-ink/40">
                    {new Date(row.created_at).toLocaleDateString('zh-TW')} ·{' '}
                    {formatBytes(row.size_bytes)}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void copyUrl(row.public_url)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 border border-ink/15 px-2 py-1.5 font-sans text-xs text-ink/70 transition-colors duration-300 hover:border-coffee hover:text-coffee"
                    >
                      <Copy aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5" />
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(row)}
                      aria-label={`刪除 ${row.file_name}`}
                      className="border border-ink/15 px-2 py-1.5 text-ink/50 transition-colors duration-300 hover:border-red-800/40 hover:text-red-800"
                    >
                      <Trash2 aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this file?"
        description="檔案會從 Supabase Storage 永久刪除，已經引用它的內容會顯示不出圖片。"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
