'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageField from '@/components/admin/ImageField';
import RecordDrawer, { ListHeader } from '@/components/admin/RecordDrawer';
import {
  Field,
  FeaturedBadge,
  Select,
  StatusBadge,
  TagInput,
  TextArea,
  TextInput,
  Toggle,
} from '@/components/admin/Fields';
import { useCollection } from '@/lib/admin/useCollection';
import type { TechStatus, TechnologyProjectRow } from '@/lib/types/database';

const STATUS_OPTIONS: { value: TechStatus; label: string }[] = [
  { value: 'exploring', label: 'Exploring' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

type Form = {
  name: string;
  technologies: string[];
  category: string;
  description: string;
  project_url: string;
  github_url: string;
  cover_image_url: string | null;
  start_date: string;
  status: TechStatus;
  published: boolean;
  featured: boolean;
};

const emptyForm: Form = {
  name: '',
  technologies: [],
  category: '',
  description: '',
  project_url: '',
  github_url: '',
  cover_image_url: null,
  start_date: '',
  status: 'exploring',
  published: false,
  featured: false,
};

const nullable = (value: string) => (value.trim() === '' ? null : value.trim());

export default function AdminTechnologyPage() {
  const { rows, loading, busy, create, update, remove } =
    useCollection<TechnologyProjectRow>('technology_projects');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<TechnologyProjectRow | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (row: TechnologyProjectRow) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      technologies: row.technologies ?? [],
      category: row.category ?? '',
      description: row.description ?? '',
      project_url: row.project_url ?? '',
      github_url: row.github_url ?? '',
      cover_image_url: row.cover_image_url,
      start_date: row.start_date ?? '',
      status: row.status,
      published: row.published,
      featured: row.featured,
    });
    setDrawerOpen(true);
  };

  const save = async () => {
    const payload = {
      name: form.name.trim() || 'Untitled',
      technologies: form.technologies,
      category: nullable(form.category),
      description: nullable(form.description),
      project_url: nullable(form.project_url),
      github_url: nullable(form.github_url),
      cover_image_url: form.cover_image_url,
      start_date: nullable(form.start_date),
      status: form.status,
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

  return (
    <>
      <ListHeader
        title="AI &amp; Tech"
        description="技術探索與專案"
        actionLabel="New Project"
        onAction={openNew}
      />

      <div className="py-8">
        {loading ? (
          <p className="font-sans text-sm text-ink/40">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="border border-dashed border-ink/15 p-8 text-center font-sans text-sm text-ink/40">
            還沒有任何技術專案。按右上角的 New Project 開始。
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="group flex h-full w-full flex-col border border-ink/10 p-5 text-left transition-colors duration-300 hover:bg-sand"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusBadge published={row.published} />
                    <FeaturedBadge featured={row.featured} />
                    <span className="label-text text-sage">{row.status}</span>
                  </span>

                  <span className="mt-4 block font-serif text-xl leading-snug text-ink group-hover:text-coffee">
                    {row.name}
                  </span>

                  {row.technologies.length > 0 && (
                    <span className="mt-2 block font-mono text-[0.6875rem] uppercase tracking-label text-sage">
                      {row.technologies.join(' / ')}
                    </span>
                  )}

                  {row.description && (
                    <span className="mt-3 line-clamp-3 block font-tc text-sm leading-relaxed text-ink/60">
                      {row.description}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
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
            <Field label="Project Name" className="sm:col-span-2">
              <TextInput
                value={form.name}
                onChange={(v) => set('name', v)}
                placeholder="Hermes Personal Agent"
              />
            </Field>
            <Field label="Category">
              <TextInput
                value={form.category}
                onChange={(v) => set('category', v)}
                placeholder="Automation / Research"
              />
            </Field>
            <Field label="Start Date">
              <TextInput
                type="date"
                value={form.start_date}
                onChange={(v) => set('start_date', v)}
              />
            </Field>
            <Field label="Status" className="sm:col-span-2">
              <Select
                value={form.status}
                onChange={(v) => set('status', v as TechStatus)}
                options={STATUS_OPTIONS}
              />
            </Field>
          </div>

          <Field label="Technology" hint="輸入後按 Enter 新增">
            <TagInput
              values={form.technologies}
              onChange={(values) => set('technologies', values)}
              placeholder="Hermes Agent / Telegram / OpenAI"
            />
          </Field>

          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(v) => set('description', v)}
              rows={5}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Project URL">
              <TextInput
                type="url"
                value={form.project_url}
                onChange={(v) => set('project_url', v)}
              />
            </Field>
            <Field label="GitHub URL">
              <TextInput
                type="url"
                value={form.github_url}
                onChange={(v) => set('github_url', v)}
              />
            </Field>
          </div>

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
