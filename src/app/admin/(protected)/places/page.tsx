'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
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
import type { PlaceRow } from '@/lib/types/database';

const CATEGORIES = ['Cafe', 'Food', 'Travel', 'Local', 'Photography', 'Hualien'];

type Form = {
  title: string;
  cover_width: number | null;
  cover_height: number | null;
  subtitle: string;
  category: string;
  location: string;
  google_maps_url: string;
  short_description: string;
  story: string;
  visit_date: string;
  cover_image_url: string | null;
  gallery: string[];
  published: boolean;
  featured: boolean;
};

const emptyForm: Form = {
  title: '',
  cover_width: null,
  cover_height: null,
  subtitle: '',
  category: 'Local',
  location: '',
  google_maps_url: '',
  short_description: '',
  story: '',
  visit_date: '',
  cover_image_url: null,
  gallery: [],
  published: false,
  featured: false,
};

const nullable = (value: string) => (value.trim() === '' ? null : value.trim());

function PlacesPageInner() {
  const searchParams = useSearchParams();
  const { rows, loading, busy, create, update, remove } = useCollection<PlaceRow>('places');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PlaceRow | null>(null);

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

  const openEdit = (row: PlaceRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      subtitle: row.subtitle ?? '',
      category: row.category ?? 'Local',
      location: row.location ?? '',
      google_maps_url: row.google_maps_url ?? '',
      short_description: row.short_description ?? '',
      story: row.story ?? '',
      visit_date: row.visit_date ?? '',
      cover_image_url: row.cover_image_url,
      cover_width: row.cover_width,
      cover_height: row.cover_height,
      gallery: row.gallery ?? [],
      published: row.published,
      featured: row.featured,
    });
    setDrawerOpen(true);
  };

  const save = async () => {
    const payload = {
      title: form.title.trim() || 'Untitled',
      subtitle: nullable(form.subtitle),
      category: nullable(form.category),
      location: nullable(form.location),
      google_maps_url: nullable(form.google_maps_url),
      short_description: nullable(form.short_description),
      story: nullable(form.story),
      visit_date: nullable(form.visit_date),
      cover_image_url: form.cover_image_url,
      cover_width: form.cover_width,
      cover_height: form.cover_height,
      gallery: form.gallery,
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
        title="Places"
        description="花蓮與其他地方的紀錄"
        actionLabel="New Place"
        onAction={openNew}
      />

      <div className="py-8">
        {loading ? (
          <p className="font-sans text-sm text-ink/40">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="border border-dashed border-ink/15 p-8 text-center font-sans text-sm text-ink/40">
            還沒有任何地點。按右上角的 New Place 開始。
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="group block w-full border border-ink/10 text-left transition-colors duration-300 hover:border-coffee/40"
                >
                  <span className="block aspect-[3/2] w-full overflow-hidden bg-sand">
                    {row.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.cover_image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-ink/25">
                        <span className="label-text">NO IMAGE</span>
                      </span>
                    )}
                  </span>

                  <span className="block p-4">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge published={row.published} />
                      <FeaturedBadge featured={row.featured} />
                    </span>
                    <span className="mt-3 block font-serif text-lg leading-snug text-ink group-hover:text-coffee">
                      {row.title}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-3 font-sans text-xs text-ink/45">
                      <span>{row.category || '—'}</span>
                      <span>{row.visit_date || '—'}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <RecordDrawer
        open={drawerOpen}
        title={editingId ? 'Edit Place' : 'New Place'}
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
            <Field label="Subtitle" className="sm:col-span-2">
              <TextInput value={form.subtitle} onChange={(v) => set('subtitle', v)} />
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(v) => set('category', v)}
                options={CATEGORIES.map((value) => ({ value, label: value }))}
              />
            </Field>
            <Field label="Visit Date">
              <TextInput
                type="date"
                value={form.visit_date}
                onChange={(v) => set('visit_date', v)}
              />
            </Field>
            <Field label="Location" className="sm:col-span-2">
              <TextInput
                value={form.location}
                onChange={(v) => set('location', v)}
                placeholder="Hualien, Taiwan"
              />
            </Field>
            <Field label="Google Maps URL" className="sm:col-span-2">
              <TextInput
                type="url"
                value={form.google_maps_url}
                onChange={(v) => set('google_maps_url', v)}
                placeholder="https://maps.google.com/…"
              />
            </Field>
          </div>

          <Field label="Short Description">
            <TextArea
              value={form.short_description}
              onChange={(v) => set('short_description', v)}
              rows={3}
            />
          </Field>

          <Field label="Story">
            <TextArea value={form.story} onChange={(v) => set('story', v)} rows={8} />
          </Field>

          <ImageField
            label="Cover Image"
            hint="橫式、直式、方形都可以，版面會自動處理"
            value={form.cover_image_url}
            onChange={(url) => set('cover_image_url', url)}
            onMeta={({ width, height }) => {
              set('cover_width', width);
              set('cover_height', height);
            }}
          />

          <Field label="Gallery" hint="貼上圖片網址後按 Enter，可從 Media Library 複製">
            <TagInput
              values={form.gallery}
              onChange={(values) => set('gallery', values)}
              placeholder="https://…"
            />
          </Field>

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
              description="可出現在首頁"
            />
          </div>
        </div>
      </RecordDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this place?"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}

export default function AdminPlacesPage() {
  return (
    <Suspense fallback={<p className="py-8 font-sans text-sm text-ink/40">Loading…</p>}>
      <PlacesPageInner />
    </Suspense>
  );
}
