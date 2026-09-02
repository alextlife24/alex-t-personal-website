'use client';

import EditorShell, { Panel } from '@/components/admin/EditorShell';
import ImageField from '@/components/admin/ImageField';
import { Field, TagInput, TextArea, TextInput } from '@/components/admin/Fields';
import { useSingleton } from '@/lib/admin/useSingleton';
import { hero as heroFallback } from '@/data/hero';

type HomeForm = {
  eyebrow: string;
  title: string;
  intro: string;
  cta_label: string;
  hero_image_url: string | null;
  hero_image_caption: string;
  keywords: string[];
};

const defaults: HomeForm = {
  eyebrow: heroFallback.eyebrow,
  title: heroFallback.titleLines.join('\n'),
  intro: heroFallback.bodyLines.join('\n'),
  cta_label: heroFallback.cta.label,
  hero_image_url: null,
  hero_image_caption: heroFallback.imageCaption,
  keywords: [...heroFallback.keywords],
};

export default function AdminHomePage() {
  const { form, update, dirty, loading, saving, save } = useSingleton<HomeForm>(
    'home_content',
    defaults,
  );

  const titleLines = form.title.split('\n').filter(Boolean);
  const introLines = form.intro.split('\n').filter(Boolean);

  return (
    <EditorShell
      title="Home"
      description="首頁 Hero 區塊"
      dirty={dirty}
      saving={saving}
      onSave={() => void save()}
    >
      {loading ? (
        <p className="font-sans text-sm text-ink/40">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-5">
          {/* 編輯區 */}
          <div className="space-y-6 xl:col-span-3">
            <Panel title="Hero">
              <div className="space-y-5">
                <Field label="Eyebrow" hint="標題上方的小字">
                  <TextInput
                    value={form.eyebrow}
                    onChange={(value) => update('eyebrow', value)}
                    placeholder="A PERSONAL JOURNAL"
                  />
                </Field>

                <Field label="Main Title" hint="一行一句，換行即分行顯示">
                  <TextArea
                    value={form.title}
                    onChange={(value) => update('title', value)}
                    rows={3}
                    placeholder={'Collecting moments,\nbrewing ideas.'}
                  />
                </Field>

                <Field label="Chinese Introduction" hint="一行一句">
                  <TextArea
                    value={form.intro}
                    onChange={(value) => update('intro', value)}
                    rows={5}
                  />
                </Field>

                <Field label="Explore Button Text">
                  <TextInput
                    value={form.cta_label}
                    onChange={(value) => update('cta_label', value)}
                    placeholder="Explore My World"
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Hero Image">
              <div className="space-y-5">
                <ImageField
                  label="Image"
                  hint="建議 4:5 直式構圖。留空則顯示 Placeholder。"
                  value={form.hero_image_url}
                  onChange={(url) => update('hero_image_url', url)}
                />
                <Field label="Image Caption">
                  <TextInput
                    value={form.hero_image_caption}
                    onChange={(value) => update('hero_image_caption', value)}
                    placeholder="Hualien, Taiwan"
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Keywords" description="Hero 最底部的關鍵字列">
              <TagInput
                values={form.keywords}
                onChange={(values) => update('keywords', values)}
                placeholder="Coffee / Photography / Hualien…"
              />
            </Panel>
          </div>

          {/* Live Preview */}
          <div className="xl:col-span-2">
            <div className="xl:sticky xl:top-28">
              <p className="label-text mb-3 text-ink/45">LIVE PREVIEW</p>
              <div className="border border-ink/10 bg-paper p-6">
                <p className="text-[0.5rem] uppercase tracking-label text-coffee">
                  {form.eyebrow}
                </p>
                <h3 className="mt-3 font-serif text-2xl leading-[1.1] text-ink">
                  {titleLines.map((line, index) => (
                    <span key={`${line}-${index}`} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="mt-4 font-tc text-[0.6875rem] leading-[1.9] text-ink/70">
                  {introLines.map((line, index) => (
                    <span key={`${line}-${index}`} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <p className="mt-5 inline-block border-b border-ink/25 pb-1 font-sans text-[0.6875rem] text-ink">
                  {form.cta_label} ↓
                </p>

                <div className="mt-6 aspect-[4/5] w-full overflow-hidden border border-beige bg-sand">
                  {form.hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.hero_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink/30">
                      <span className="label-text">IMAGE</span>
                      <span className="font-sans text-[0.625rem]">Replace later</span>
                    </div>
                  )}
                </div>
                <p className="mt-2 font-sans text-[0.625rem] text-ink/40">
                  {form.hero_image_caption}
                </p>

                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-ink/10 pt-3">
                  {form.keywords.map((word) => (
                    <li
                      key={word}
                      className="text-[0.5rem] uppercase tracking-label text-ink/45"
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 font-sans text-xs text-ink/35">
                這是縮小版示意，實際比例以前台為準。
              </p>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
