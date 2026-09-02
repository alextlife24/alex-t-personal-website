'use client';

import EditorShell, { Panel } from '@/components/admin/EditorShell';
import ImageField from '@/components/admin/ImageField';
import { Field, TextArea, TextInput } from '@/components/admin/Fields';
import { useSingleton } from '@/lib/admin/useSingleton';

type SettingsForm = {
  site_name: string;
  site_title: string;
  description: string;
  seo_description: string;
  website_url: string;
  footer_text: string;
  location: string;
  og_image_url: string | null;
  favicon_url: string | null;
};

const defaults: SettingsForm = {
  site_name: 'Alex T',
  site_title: 'Coffee, Places & Ideas',
  description: 'A personal journal by Alex T.',
  seo_description:
    'A personal journal by Alex T exploring coffee, photography, Hualien, technology and everyday life.',
  website_url: 'https://alext.example.com',
  footer_text: '© 2026 Alex T.',
  location: 'Taiwan',
  og_image_url: null,
  favicon_url: null,
};

export default function AdminSettingsPage() {
  const { form, update, dirty, loading, saving, save } = useSingleton<SettingsForm>(
    'site_settings',
    defaults,
  );

  return (
    <EditorShell
      title="Site Settings"
      description="網站基本資料與 SEO"
      dirty={dirty}
      saving={saving}
      onSave={() => void save()}
    >
      {loading ? (
        <p className="font-sans text-sm text-ink/40">Loading…</p>
      ) : (
        <div className="max-w-3xl space-y-6">
          <Panel title="Identity">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Site Name">
                <TextInput
                  value={form.site_name}
                  onChange={(value) => update('site_name', value)}
                />
              </Field>
              <Field label="Site Title">
                <TextInput
                  value={form.site_title}
                  onChange={(value) => update('site_title', value)}
                />
              </Field>
              <Field label="Location">
                <TextInput
                  value={form.location}
                  onChange={(value) => update('location', value)}
                  placeholder="Taiwan"
                />
              </Field>
              <Field label="Footer Text">
                <TextInput
                  value={form.footer_text}
                  onChange={(value) => update('footer_text', value)}
                  placeholder="© 2026 Alex T."
                />
              </Field>
            </div>
            <p className="mt-4 font-sans text-xs text-ink/35">
              瀏覽器標題會組成：<span className="text-coffee">{form.site_name} — {form.site_title}</span>
            </p>
          </Panel>

          <Panel title="SEO">
            <div className="space-y-5">
              <Field label="Description" hint="網站簡短描述">
                <TextArea
                  value={form.description}
                  onChange={(value) => update('description', value)}
                  rows={3}
                />
              </Field>
              <Field label="SEO Description" hint="搜尋結果與 Open Graph 使用">
                <TextArea
                  value={form.seo_description}
                  onChange={(value) => update('seo_description', value)}
                  rows={3}
                />
              </Field>
              <Field label="Website URL" hint="正式網域，會用於 sitemap 與 canonical">
                <TextInput
                  type="url"
                  value={form.website_url}
                  onChange={(value) => update('website_url', value)}
                  placeholder="https://your-domain.com"
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Images">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <ImageField
                label="Open Graph Image"
                hint="分享到社群時顯示的預覽圖"
                value={form.og_image_url}
                onChange={(url) => update('og_image_url', url)}
              />
              <ImageField
                label="Favicon"
                hint="瀏覽器分頁小圖示"
                value={form.favicon_url}
                onChange={(url) => update('favicon_url', url)}
              />
            </div>
          </Panel>
        </div>
      )}
    </EditorShell>
  );
}
