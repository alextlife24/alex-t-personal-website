'use client';

import { GripVertical, Plus, Star } from 'lucide-react';
import { useRef, useState } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import RecordDrawer, { ListHeader } from '@/components/admin/RecordDrawer';
import {
  Field,
  FeaturedBadge,
  Select,
  StatusBadge,
  TextArea,
  TextInput,
  Toggle,
} from '@/components/admin/Fields';
import { useToast } from '@/components/admin/Toast';
import { useCollection } from '@/lib/admin/useCollection';
import { uploadOne } from '@/lib/admin/upload';
import { getBrowserClient } from '@/lib/supabase/client';
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/supabase/config';
import type { PhotoRow } from '@/lib/types/database';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Hualien', 'Street', 'Coffee', 'Travel', 'Daily Life'];

type Form = {
  title: string;
  location: string;
  camera: string;
  lens: string;
  taken_on: string;
  caption: string;
  category: string;
  published: boolean;
  featured: boolean;
};

const nullable = (value: string) => (value.trim() === '' ? null : value.trim());

export default function AdminPhotographyPage() {
  const { toast } = useToast();
  const { rows, loading, busy, create, update, remove, persistOrder } =
    useCollection<PhotoRow>('photos');

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<PhotoRow | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhotoRow | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => (current ? { ...current, [key]: value } : current));

  /** 支援一次選取多張照片 */
  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const supabase = getBrowserClient();
    if (!supabase) {
      toast('尚未設定 Supabase，無法上傳。', 'error');
      return;
    }

    setUploading(true);
    let added = 0;

    for (const file of Array.from(files)) {
      const result = await uploadOne(supabase, file, () => {});
      if (!result.ok) {
        toast(`${file.name}：${result.error}`, 'error');
        continue;
      }
      await create({
        image_url: result.media.public_url,
        title: file.name.replace(/\.[^.]+$/, ''),
        category: 'Hualien',
        // 記錄原始尺寸，前台 masonry 才能保留照片比例
        width: result.media.width,
        height: result.media.height,
        focal_x: 0.5,
        focal_y: 0.5,
        published: true,
        sort_order: rows.length + added,
      });
      added += 1;
    }

    setUploading(false);
    if (added > 0) toast(`已上傳 ${added} 張照片。`);
  };

  const openEdit = (row: PhotoRow) => {
    setEditing(row);
    setForm({
      title: row.title ?? '',
      location: row.location ?? '',
      camera: row.camera ?? '',
      lens: row.lens ?? '',
      taken_on: row.taken_on ?? '',
      caption: row.caption ?? '',
      category: row.category ?? 'Hualien',
      published: row.published,
      featured: row.featured,
    });
  };

  const save = async () => {
    if (!editing || !form) return;
    const ok = await update(editing.id, {
      title: nullable(form.title),
      location: nullable(form.location),
      camera: nullable(form.camera),
      lens: nullable(form.lens),
      taken_on: nullable(form.taken_on),
      caption: nullable(form.caption),
      category: nullable(form.category),
      published: form.published,
      featured: form.featured,
    });
    if (ok) setEditing(null);
  };

  const toggleFeatured = async (row: PhotoRow) => {
    await update(row.id, { featured: !row.featured });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ok = await remove(deleteTarget.id);
    setDeleteTarget(null);
    if (ok) setEditing(null);
  };

  /** 桌機拖曳排序；手機用卡片上的 ↑ ↓ 按鈕 */
  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    void persistOrder(next);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    void persistOrder(next);
  };

  return (
    <>
      <ListHeader
        title="Photography"
        description="可一次選取多張照片上傳"
        actionLabel={uploading ? 'Uploading…' : 'Add Photo'}
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
              還沒有照片，點這裡選取檔案上傳
            </span>
          </button>
        ) : (
          <>
            <p className="mb-4 font-sans text-xs text-ink/35">
              桌機可直接拖曳縮圖調整順序；手機請使用卡片上的 ↑ ↓ 按鈕。
            </p>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {rows.map((row, index) => (
                <li
                  key={row.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={cn(
                    'group relative border border-ink/10 bg-paper transition-colors duration-300',
                    dragIndex === index && 'opacity-40',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="block w-full text-left"
                  >
                    <span className="block aspect-square w-full overflow-hidden bg-sand">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.image_url}
                        alt={row.title ?? ''}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </span>
                    <span className="block p-3">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge published={row.published} />
                        <FeaturedBadge featured={row.featured} />
                      </span>
                      <span className="mt-2 block truncate font-sans text-sm text-ink">
                        {row.title || 'Untitled'}
                      </span>
                      <span className="mt-0.5 block truncate font-sans text-xs text-ink/40">
                        {row.location || '—'} · {row.category || '—'}
                      </span>
                    </span>
                  </button>

                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => void toggleFeatured(row)}
                      aria-label={row.featured ? '取消 Featured' : '設為 Featured'}
                      className={cn(
                        'bg-paper/90 p-1.5 shadow-sm transition-colors',
                        row.featured ? 'text-coffee' : 'text-ink/40 hover:text-coffee',
                      )}
                    >
                      <Star
                        aria-hidden
                        strokeWidth={1.5}
                        className="h-3.5 w-3.5"
                        fill={row.featured ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  <div className="absolute left-2 top-2 flex items-center gap-1">
                    <span className="hidden bg-paper/90 p-1.5 text-ink/30 shadow-sm md:block">
                      <GripVertical aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5" />
                    </span>
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="上移"
                      className="bg-paper/90 px-2 py-1 font-sans text-xs text-ink/50 shadow-sm transition-colors hover:text-coffee disabled:opacity-30 md:hidden"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1}
                      aria-label="下移"
                      className="bg-paper/90 px-2 py-1 font-sans text-xs text-ink/50 shadow-sm transition-colors hover:text-coffee disabled:opacity-30 md:hidden"
                    >
                      ↓
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <RecordDrawer
        open={Boolean(editing && form)}
        title="Edit Photo"
        saving={busy}
        onClose={() => setEditing(null)}
        onSave={() => void save()}
        onDelete={() => editing && setDeleteTarget(editing)}
      >
        {editing && form && (
          <div className="space-y-5">
            <div className="aspect-[4/3] w-full overflow-hidden border border-ink/10 bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editing.image_url}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2">
                <TextInput value={form.title} onChange={(v) => set('title', v)} />
              </Field>
              <Field label="Location">
                <TextInput
                  value={form.location}
                  onChange={(v) => set('location', v)}
                  placeholder="Hualien"
                />
              </Field>
              <Field label="Date">
                <TextInput
                  type="date"
                  value={form.taken_on}
                  onChange={(v) => set('taken_on', v)}
                />
              </Field>
              <Field label="Camera">
                <TextInput
                  value={form.camera}
                  onChange={(v) => set('camera', v)}
                  placeholder="Nikon COOLPIX L11"
                />
              </Field>
              <Field label="Lens">
                <TextInput value={form.lens} onChange={(v) => set('lens', v)} />
              </Field>
              <Field label="Category" className="sm:col-span-2">
                <Select
                  value={form.category}
                  onChange={(v) => set('category', v)}
                  options={CATEGORIES.map((value) => ({ value, label: value }))}
                />
              </Field>
              <Field label="Caption" className="sm:col-span-2">
                <TextArea value={form.caption} onChange={(v) => set('caption', v)} rows={3} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-ink/10 pt-5 sm:grid-cols-2">
              <Toggle
                checked={form.published}
                onChange={(checked) => set('published', checked)}
                label={form.published ? 'Published' : 'Draft'}
                description={form.published ? '會出現在公開網站' : '不會出現在公開網站'}
              />
              <Toggle
                checked={form.featured}
                onChange={(checked) => set('featured', checked)}
                label="Featured"
                description="優先顯示"
              />
            </div>
          </div>
        )}
      </RecordDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this photo?"
        description="照片紀錄會被刪除。已上傳的檔案仍保留在 Media Library。"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
