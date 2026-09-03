'use client';

import { Copy, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import MultiUploader from '@/components/admin/MultiUploader';
import { Field, Select, TextInput } from '@/components/admin/Fields';
import { ListHeader } from '@/components/admin/RecordDrawer';
import { useToast } from '@/components/admin/Toast';
import { deleteImage, formatBytes } from '@/lib/admin/upload';
import { getBrowserClient } from '@/lib/supabase/client';
import type { MediaRow } from '@/lib/types/database';
import { cn } from '@/lib/utils';

type ViewMode = 'original' | 'landscape' | 'portrait' | 'square';

const VIEW_RATIO: Record<ViewMode, string> = {
  original: '',
  landscape: 'aspect-[3/2]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
};

export default function AdminMediaPage() {
  const { toast } = useToast();

  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<ViewMode>('square');
  const [deleteTarget, setDeleteTarget] = useState<MediaRow | null>(null);
  const [editing, setEditing] = useState<MediaRow | null>(null);

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

    if (error) toast(`讀取失敗：${error.message}`, 'error');
    else setRows(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('URL copied.');
    } catch {
      toast('無法複製，請手動選取網址。', 'error');
    }
  };

  const saveMeta = async () => {
    if (!editing) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    setBusy(true);
    const { error } = await supabase
      .from('media')
      .update({
        alt: editing.alt?.trim() || null,
        caption: editing.caption?.trim() || null,
        focal_x: editing.focal_x,
        focal_y: editing.focal_y,
      })
      .eq('id', editing.id);
    setBusy(false);

    if (error) {
      toast(`儲存失敗：${error.message}`, 'error');
      return;
    }
    setEditing(null);
    await refresh();
    toast('Saved successfully.');
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
      <ListHeader title="Media Library" description="一次最多 20 張，不限制照片比例" />

      <div className="py-8">
        <MultiUploader onUploaded={(media) => setRows((current) => [media, ...current])} />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="label-text text-ink/45">{rows.length} 個檔案</p>

          <div className="flex items-center gap-2">
            <span className="label-text text-ink/35">VIEW</span>
            {(['original', 'landscape', 'portrait', 'square'] as ViewMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  className={cn(
                    'border px-2.5 py-1 font-sans text-xs transition-colors duration-300',
                    view === mode
                      ? 'border-coffee bg-coffee/10 text-coffee'
                      : 'border-ink/15 text-ink/50 hover:border-coffee/40',
                  )}
                >
                  {mode === 'original'
                    ? 'Original'
                    : mode === 'landscape'
                      ? 'Landscape'
                      : mode === 'portrait'
                        ? 'Portrait'
                        : 'Square'}
                </button>
              ),
            )}
          </div>
        </div>

        {loading ? (
          <p className="mt-6 font-sans text-sm text-ink/40">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-6 border border-dashed border-ink/15 p-10 text-center font-sans text-sm text-ink/40">
            媒體庫是空的，從上方拖曳或選擇檔案開始上傳。
          </p>
        ) : view === 'original' ? (
          // Original：masonry，完整保留每張照片的比例
          <div className="mt-6 columns-2 gap-4 md:columns-3 xl:columns-4 [&>div]:mb-4">
            {rows.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                ratioClass=""
                onCopy={() => void copyUrl(media.public_url)}
                onDelete={() => setDeleteTarget(media)}
                onEdit={() => setEditing(media)}
              />
            ))}
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {rows.map((media) => (
              <li key={media.id}>
                <MediaCard
                  media={media}
                  ratioClass={VIEW_RATIO[view]}
                  onCopy={() => void copyUrl(media.public_url)}
                  onDelete={() => setDeleteTarget(media)}
                  onEdit={() => setEditing(media)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 編輯 alt / caption / 焦點 */}
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6">
          <div className="w-full max-w-lg bg-paper p-6 shadow-xl">
            <h2 className="font-serif text-xl text-ink">Image details</h2>
            <p className="mt-1 truncate font-sans text-xs text-ink/40">
              {editing.file_name}
              {editing.width && editing.height
                ? ` · ${editing.width}×${editing.height}`
                : ''}
            </p>

            <div className="mt-5 space-y-4">
              <Field label="Alt Text">
                <TextInput
                  value={editing.alt ?? ''}
                  onChange={(value) => setEditing({ ...editing, alt: value })}
                />
              </Field>
              <Field label="Caption">
                <TextInput
                  value={editing.caption ?? ''}
                  onChange={(value) => setEditing({ ...editing, caption: value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Focal X" hint="0 左 · 0.5 中 · 1 右">
                  <Select
                    value={String(editing.focal_x)}
                    onChange={(value) =>
                      setEditing({ ...editing, focal_x: Number(value) })
                    }
                    options={[
                      { value: '0', label: '0 — 左' },
                      { value: '0.25', label: '0.25' },
                      { value: '0.5', label: '0.5 — 中' },
                      { value: '0.75', label: '0.75' },
                      { value: '1', label: '1 — 右' },
                    ]}
                  />
                </Field>
                <Field label="Focal Y" hint="0 上 · 0.5 中 · 1 下">
                  <Select
                    value={String(editing.focal_y)}
                    onChange={(value) =>
                      setEditing({ ...editing, focal_y: Number(value) })
                    }
                    options={[
                      { value: '0', label: '0 — 上' },
                      { value: '0.25', label: '0.25' },
                      { value: '0.5', label: '0.5 — 中' },
                      { value: '0.75', label: '0.75' },
                      { value: '1', label: '1 — 下' },
                    ]}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="border border-ink/20 px-4 py-2.5 font-sans text-sm text-ink transition-colors hover:border-ink/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveMeta()}
                disabled={busy}
                className="bg-ink px-5 py-2.5 font-sans text-sm text-paper transition-colors hover:bg-coffee disabled:opacity-60"
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

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

function MediaCard({
  media,
  ratioClass,
  onCopy,
  onDelete,
  onEdit,
}: {
  media: MediaRow;
  ratioClass: string;
  onCopy: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="break-inside-avoid border border-ink/10 bg-paper">
      <button type="button" onClick={onEdit} className="block w-full">
        <span className={cn('block w-full overflow-hidden bg-sand', ratioClass)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.public_url}
            alt={media.alt ?? media.file_name}
            className={cn('w-full', ratioClass ? 'h-full object-cover' : 'h-auto')}
            style={
              ratioClass
                ? {
                    objectPosition: `${Number(media.focal_x) * 100}% ${
                      Number(media.focal_y) * 100
                    }%`,
                  }
                : undefined
            }
          />
        </span>
      </button>

      <div className="p-3">
        <p className="truncate font-sans text-sm text-ink" title={media.file_name}>
          {media.file_name}
        </p>
        <p className="mt-1 font-sans text-xs text-ink/40">
          {media.width && media.height ? `${media.width}×${media.height} · ` : ''}
          {formatBytes(media.size_bytes)}
        </p>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 border border-ink/15 px-2 py-1.5 font-sans text-xs text-ink/70 transition-colors duration-300 hover:border-coffee hover:text-coffee"
          >
            <Copy aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5" />
            Copy URL
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`刪除 ${media.file_name}`}
            className="border border-ink/15 px-2 py-1.5 text-ink/50 transition-colors duration-300 hover:border-red-800/40 hover:text-red-800"
          >
            <Trash2 aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
