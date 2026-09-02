'use client';

import { GripVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageField from '@/components/admin/ImageField';
import RecordDrawer, { ListHeader } from '@/components/admin/RecordDrawer';
import {
  Field,
  FeaturedBadge,
  StatusBadge,
  TextArea,
  TextInput,
  Toggle,
} from '@/components/admin/Fields';
import { useCollection } from '@/lib/admin/useCollection';
import type { ProjectRow } from '@/lib/types/database';
import { cn } from '@/lib/utils';

type Form = {
  title: string;
  category: string;
  year: string;
  description: string;
  cover_image_url: string | null;
  url: string;
  published: boolean;
  featured: boolean;
};

const emptyForm: Form = {
  title: '',
  category: '',
  year: String(new Date().getFullYear()),
  description: '',
  cover_image_url: null,
  url: '',
  published: false,
  featured: false,
};

const nullable = (value: string) => (value.trim() === '' ? null : value.trim());

function ProjectsPageInner() {
  const searchParams = useSearchParams();
  const { rows, loading, busy, create, update, remove, persistOrder } =
    useCollection<ProjectRow>('projects');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingId(null);
      setForm(emptyForm);
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (row: ProjectRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      category: row.category ?? '',
      year: row.year ?? '',
      description: row.description ?? '',
      cover_image_url: row.cover_image_url,
      url: row.url ?? '',
      published: row.published,
      featured: row.featured,
    });
    setDrawerOpen(true);
  };

  const save = async () => {
    const payload = {
      title: form.title.trim() || 'Untitled',
      category: nullable(form.category),
      year: nullable(form.year),
      description: nullable(form.description),
      cover_image_url: form.cover_image_url,
      url: nullable(form.url),
      published: form.published,
      featured: form.featured,
    };
    const ok = editingId ? await update(editingId, payload) : await create(payload);
    if (ok) setDrawerOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ok = await remove(deleteTarget.id);
    setDeleteTarget(null);
    if (ok) setDrawerOpen(false);
  };

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
        title="Projects"
        description="前台 Selected Projects，順序即首頁顯示順序"
        actionLabel="New Project"
        onAction={openNew}
      />

      <div className="py-8">
        {loading ? (
          <p className="font-sans text-sm text-ink/40">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="border border-dashed border-ink/15 p-8 text-center font-sans text-sm text-ink/40">
            還沒有任何專案。按右上角的 New Project 開始。
          </p>
        ) : (
          <>
            <p className="mb-4 font-sans text-xs text-ink/35">
              桌機可拖曳整列調整順序；手機請使用 ↑ ↓ 按鈕。
            </p>
            <ul className="border-t border-ink/10">
              {rows.map((row, index) => (
                <li
                  key={row.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={cn(
                    'flex items-center gap-3 border-b border-ink/10 transition-colors duration-300 hover:bg-sand',
                    dragIndex === index && 'opacity-40',
                  )}
                >
                  <span className="hidden shrink-0 pl-2 text-ink/25 md:block">
                    <GripVertical aria-hidden strokeWidth={1.5} className="h-4 w-4" />
                  </span>

                  <span className="flex shrink-0 flex-col md:hidden">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="上移"
                      className="px-2 font-sans text-xs text-ink/40 disabled:opacity-25"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1}
                      aria-label="下移"
                      className="px-2 font-sans text-xs text-ink/40 disabled:opacity-25"
                    >
                      ↓
                    </button>
                  </span>

                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="group flex flex-1 flex-wrap items-center gap-x-5 gap-y-1 py-4 pr-2 text-left"
                  >
                    <span className="label-text w-6 shrink-0 text-coffee/60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1 font-serif text-lg text-ink group-hover:text-coffee">
                      {row.title}
                    </span>
                    <span className="w-40 shrink-0 font-sans text-xs text-ink/50">
                      {row.category || '—'}
                    </span>
                    <span className="w-14 shrink-0 font-sans text-xs text-ink/40">
                      {row.year || '—'}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge published={row.published} />
                      <FeaturedBadge featured={row.featured} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <RecordDrawer
        open={drawerOpen}
        title={editingId ? 'Edit Project' : 'New Project'}
        saving={busy}
        onClose={() => setDrawerOpen(false)}
        onSave={() => void save()}
        onDelete={
          editingId
            ? () => {
                const row = rows.find((item) => item.id === editingId);
                if (row) setDeleteTarget(row);
              }
            : undefined
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <TextInput value={form.title} onChange={(v) => set('title', v)} />
            </Field>
            <Field label="Category">
              <TextInput
                value={form.category}
                onChange={(v) => set('category', v)}
                placeholder="Local / Travel"
              />
            </Field>
            <Field label="Year">
              <TextInput value={form.year} onChange={(v) => set('year', v)} placeholder="2026" />
            </Field>
            <Field label="URL" className="sm:col-span-2">
              <TextInput type="url" value={form.url} onChange={(v) => set('url', v)} />
            </Field>
          </div>

          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(v) => set('description', v)}
              rows={4}
            />
          </Field>

          <ImageField
            label="Cover Image"
            value={form.cover_image_url}
            onChange={(url) => set('cover_image_url', url)}
          />

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
      </RecordDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this project?"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<p className="py-8 font-sans text-sm text-ink/40">Loading…</p>}>
      <ProjectsPageInner />
    </Suspense>
  );
}
