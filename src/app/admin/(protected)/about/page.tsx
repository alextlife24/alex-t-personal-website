'use client';

import EditorShell, { Panel } from '@/components/admin/EditorShell';
import { Field, TagInput, TextArea, TextInput } from '@/components/admin/Fields';
import { useSingleton } from '@/lib/admin/useSingleton';
import { about as aboutFallback } from '@/data/about';

type AboutForm = {
  section_label: string;
  title: string;
  paragraphs: string[];
  interests: string[];
};

const defaults: AboutForm = {
  section_label: aboutFallback.label.title,
  title: aboutFallback.heading,
  paragraphs: [...aboutFallback.paragraphs],
  interests: [...aboutFallback.interests],
};

export default function AdminAboutPage() {
  const { form, update, dirty, loading, saving, save } = useSingleton<AboutForm>(
    'about_content',
    defaults,
  );

  return (
    <EditorShell
      title="About"
      description="01 / ABOUT 區塊"
      dirty={dirty}
      saving={saving}
      onSave={() => void save()}
    >
      {loading ? (
        <p className="font-sans text-sm text-ink/40">Loading…</p>
      ) : (
        <div className="max-w-3xl space-y-6">
          <Panel title="Section">
            <div className="space-y-5">
              <Field label="Section Label">
                <TextInput
                  value={form.section_label}
                  onChange={(value) => update('section_label', value)}
                  placeholder="ABOUT"
                />
              </Field>
              <Field label="Title">
                <TextInput
                  value={form.title}
                  onChange={(value) => update('title', value)}
                  placeholder="A little about me."
                />
              </Field>
            </div>
          </Panel>

          <Panel
            title="About Paragraphs"
            description="一段一格。空白行會自動忽略。"
          >
            <TextArea
              value={form.paragraphs.join('\n\n')}
              onChange={(value) =>
                update(
                  'paragraphs',
                  value
                    .split(/\n{2,}/)
                    .map((line) => line.trim())
                    .filter(Boolean),
                )
              }
              rows={12}
            />
            <p className="mt-3 font-sans text-xs text-ink/35">
              段落之間請空一行。目前共 {form.paragraphs.length} 段。
            </p>
          </Panel>

          <Panel
            title="Interest Tags"
            description="可新增、刪除、上下調整順序"
          >
            <TagInput
              values={form.interests}
              onChange={(values) => update('interests', values)}
              placeholder="Coffee / Photography / Hualien…"
            />
          </Panel>
        </div>
      )}
    </EditorShell>
  );
}
