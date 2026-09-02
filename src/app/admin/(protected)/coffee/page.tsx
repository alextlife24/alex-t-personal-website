'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageField from '@/components/admin/ImageField';
import RecordDrawer, { ListHeader } from '@/components/admin/RecordDrawer';
import {
  Field,
  Select,
  StatusBadge,
  TagInput,
  TextArea,
  TextInput,
  Toggle,
} from '@/components/admin/Fields';
import { useCollection } from '@/lib/admin/useCollection';
import type { CoffeeEntryRow, EntryType } from '@/lib/types/database';

type Form = {
  entry_type: EntryType;
  title: string;
  coffee_name: string;
  origin: string;
  region: string;
  producer: string;
  variety: string;
  process: string;
  roast_level: string;
  roaster: string;
  roast_date: string;
  brew_date: string;
  brewer: string;
  grinder: string;
  grind_setting: string;
  dose: string;
  water: string;
  water_temperature: string;
  brew_time: string;
  recipe: string;
  flavor_notes: string[];
  rating: string;
  notes: string;
  cover_image_url: string | null;
  published: boolean;
  featured: boolean;
};

const emptyForm: Form = {
  entry_type: 'brewing_note',
  title: '',
  coffee_name: '',
  origin: '',
  region: '',
  producer: '',
  variety: '',
  process: '',
  roast_level: '',
  roaster: '',
  roast_date: '',
  brew_date: '',
  brewer: '',
  grinder: '',
  grind_setting: '',
  dose: '',
  water: '',
  water_temperature: '',
  brew_time: '',
  recipe: '',
  flavor_notes: [],
  rating: '',
  notes: '',
  cover_image_url: null,
  published: false,
  featured: false,
};

const toForm = (row: CoffeeEntryRow): Form => ({
  entry_type: row.entry_type,
  title: row.title,
  coffee_name: row.coffee_name ?? '',
  origin: row.origin ?? '',
  region: row.region ?? '',
  producer: row.producer ?? '',
  variety: row.variety ?? '',
  process: row.process ?? '',
  roast_level: row.roast_level ?? '',
  roaster: row.roaster ?? '',
  roast_date: row.roast_date ?? '',
  brew_date: row.brew_date ?? '',
  brewer: row.brewer ?? '',
  grinder: row.grinder ?? '',
  grind_setting: row.grind_setting ?? '',
  dose: row.dose ?? '',
  water: row.water ?? '',
  water_temperature: row.water_temperature ?? '',
  brew_time: row.brew_time ?? '',
  recipe: row.recipe ?? '',
  flavor_notes: row.flavor_notes ?? [],
  rating: row.rating === null ? '' : String(row.rating),
  notes: row.notes ?? '',
  cover_image_url: row.cover_image_url,
  published: row.published,
  featured: row.featured,
});

/** 空字串一律存成 null，避免資料庫塞入無意義的空值 */
const nullable = (value: string) => (value.trim() === '' ? null : value.trim());

const toPayload = (form: Form) => ({
  entry_type: form.entry_type,
  title: form.title.trim() || 'Untitled',
  coffee_name: nullable(form.coffee_name),
  origin: nullable(form.origin),
  region: nullable(form.region),
  producer: nullable(form.producer),
  variety: nullable(form.variety),
  process: nullable(form.process),
  roast_level: nullable(form.roast_level),
  roaster: nullable(form.roaster),
  roast_date: nullable(form.roast_date),
  brew_date: nullable(form.brew_date),
  brewer: nullable(form.brewer),
  grinder: nullable(form.grinder),
  grind_setting: nullable(form.grind_setting),
  dose: nullable(form.dose),
  water: nullable(form.water),
  water_temperature: nullable(form.water_temperature),
  brew_time: nullable(form.brew_time),
  recipe: nullable(form.recipe),
  flavor_notes: form.flavor_notes,
  rating: form.rating === '' ? null : Number(form.rating),
  notes: nullable(form.notes),
  cover_image_url: form.cover_image_url,
  published: form.published,
  featured: form.featured,
});

function CoffeePageInner() {
  const searchParams = useSearchParams();
  const { rows, loading, busy, create, update, remove } =
    useCollection<CoffeeEntryRow>('coffee_entries');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<CoffeeEntryRow | null>(null);

  // Dashboard 的 Quick Action 會帶 ?new=1 直接開啟新增
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

  const openEdit = (row: CoffeeEntryRow) => {
    setEditingId(row.id);
    setForm(toForm(row));
    setDrawerOpen(true);
  };

  const save = async () => {
    const payload = toPayload(form);
    const ok = editingId ? await update(editingId, payload) : await create(payload);
    if (ok) setDrawerOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ok = await remove(deleteTarget.id);
    setDeleteTarget(null);
    if (ok) setDrawerOpen(false);
  };

  const isBean = form.entry_type === 'coffee_bean';

  return (
    <>
      <ListHeader
        title="Coffee"
        description="Brewing notes 與 coffee beans"
        actionLabel="New Coffee Entry"
        onAction={openNew}
      />

      <div className="py-8">
        {loading ? (
          <p className="font-sans text-sm text-ink/40">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="border border-dashed border-ink/15 p-8 text-center font-sans text-sm text-ink/40">
            還沒有任何咖啡紀錄。按右上角的 New Coffee Entry 開始。
          </p>
        ) : (
          <ul className="space-y-3 lg:space-y-0 lg:divide-y lg:divide-ink/10 lg:border-y lg:border-ink/10">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="group block w-full border border-ink/10 p-4 text-left transition-colors duration-300 hover:bg-sand lg:flex lg:items-center lg:gap-6 lg:border-0 lg:px-2 lg:py-4"
                >
                  <span className="block min-w-0 lg:flex-1">
                    <span className="block font-serif text-lg text-ink group-hover:text-coffee">
                      {row.title}
                    </span>
                    {row.coffee_name && (
                      <span className="mt-0.5 block font-sans text-xs text-ink/45">
                        {row.coffee_name}
                      </span>
                    )}
                  </span>

                  <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 lg:mt-0 lg:shrink-0">
                    <span className="w-28 font-sans text-xs text-ink/50">
                      {row.origin || '—'}
                    </span>
                    <span className="w-24 font-sans text-xs text-ink/50">
                      {row.process || '—'}
                    </span>
                    <span className="w-24 font-sans text-xs text-ink/40">
                      {row.brew_date || row.roast_date || '—'}
                    </span>
                    <StatusBadge published={row.published} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <RecordDrawer
        open={drawerOpen}
        title={editingId ? 'Edit Coffee Entry' : 'New Coffee Entry'}
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type">
              <Select
                value={form.entry_type}
                onChange={(value) => set('entry_type', value as EntryType)}
                options={[
                  { value: 'brewing_note', label: 'Brewing Note' },
                  { value: 'coffee_bean', label: 'Coffee Bean' },
                ]}
              />
            </Field>
            <Field label="Rating" hint="0–5，可留空">
              <TextInput
                type="number"
                value={form.rating}
                onChange={(value) => set('rating', value)}
                placeholder="4"
              />
            </Field>
            <Field label="Title" className="sm:col-span-2">
              <TextInput
                value={form.title}
                onChange={(value) => set('title', value)}
                placeholder="Ethiopia Washed — V60"
              />
            </Field>
            <Field label="Coffee Name" className="sm:col-span-2">
              <TextInput
                value={form.coffee_name}
                onChange={(value) => set('coffee_name', value)}
              />
            </Field>
          </div>

          <fieldset className="border-t border-ink/10 pt-5">
            <legend className="label-text text-ink/40">BEAN</legend>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Origin">
                <TextInput value={form.origin} onChange={(v) => set('origin', v)} />
              </Field>
              <Field label="Region">
                <TextInput value={form.region} onChange={(v) => set('region', v)} />
              </Field>
              <Field label="Producer">
                <TextInput value={form.producer} onChange={(v) => set('producer', v)} />
              </Field>
              <Field label="Variety">
                <TextInput value={form.variety} onChange={(v) => set('variety', v)} />
              </Field>
              <Field label="Process">
                <TextInput
                  value={form.process}
                  onChange={(v) => set('process', v)}
                  placeholder="Washed"
                />
              </Field>
              <Field label="Roast Level">
                <TextInput value={form.roast_level} onChange={(v) => set('roast_level', v)} />
              </Field>
              <Field label="Roaster">
                <TextInput value={form.roaster} onChange={(v) => set('roaster', v)} />
              </Field>
              <Field label="Roast Date">
                <TextInput
                  type="date"
                  value={form.roast_date}
                  onChange={(v) => set('roast_date', v)}
                />
              </Field>
            </div>
          </fieldset>

          {!isBean && (
            <fieldset className="border-t border-ink/10 pt-5">
              <legend className="label-text text-ink/40">BREWING</legend>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Brew Date">
                  <TextInput
                    type="date"
                    value={form.brew_date}
                    onChange={(v) => set('brew_date', v)}
                  />
                </Field>
                <Field label="Brewer">
                  <TextInput
                    value={form.brewer}
                    onChange={(v) => set('brewer', v)}
                    placeholder="Hario Switch"
                  />
                </Field>
                <Field label="Grinder">
                  <TextInput
                    value={form.grinder}
                    onChange={(v) => set('grinder', v)}
                    placeholder="Comandante C40"
                  />
                </Field>
                <Field label="Grind Setting">
                  <TextInput
                    value={form.grind_setting}
                    onChange={(v) => set('grind_setting', v)}
                  />
                </Field>
                <Field label="Coffee Dose">
                  <TextInput
                    value={form.dose}
                    onChange={(v) => set('dose', v)}
                    placeholder="15g"
                  />
                </Field>
                <Field label="Water">
                  <TextInput
                    value={form.water}
                    onChange={(v) => set('water', v)}
                    placeholder="240g"
                  />
                </Field>
                <Field label="Water Temperature">
                  <TextInput
                    value={form.water_temperature}
                    onChange={(v) => set('water_temperature', v)}
                    placeholder="92°C"
                  />
                </Field>
                <Field label="Brew Time">
                  <TextInput
                    value={form.brew_time}
                    onChange={(v) => set('brew_time', v)}
                    placeholder="2:30"
                  />
                </Field>
                <Field label="Recipe" className="sm:col-span-2">
                  <TextArea value={form.recipe} onChange={(v) => set('recipe', v)} rows={4} />
                </Field>
              </div>
            </fieldset>
          )}

          <fieldset className="border-t border-ink/10 pt-5">
            <legend className="label-text text-ink/40">NOTES</legend>
            <div className="mt-3 space-y-4">
              <Field label="Flavor Notes" hint="輸入後按 Enter 新增">
                <TagInput
                  values={form.flavor_notes}
                  onChange={(values) => set('flavor_notes', values)}
                  placeholder="Orange Blossom / Mandarin / Honey…"
                />
              </Field>
              <Field label="Notes">
                <TextArea value={form.notes} onChange={(v) => set('notes', v)} rows={5} />
              </Field>
              <ImageField
                label="Cover Image"
                value={form.cover_image_url}
                onChange={(url) => set('cover_image_url', url)}
              />
            </div>
          </fieldset>

          <fieldset className="border-t border-ink/10 pt-5">
            <legend className="label-text text-ink/40">STATUS</legend>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </fieldset>
        </div>
      </RecordDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this coffee entry?"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}

export default function AdminCoffeePage() {
  return (
    <Suspense fallback={<p className="py-8 font-sans text-sm text-ink/40">Loading…</p>}>
      <CoffeePageInner />
    </Suspense>
  );
}
