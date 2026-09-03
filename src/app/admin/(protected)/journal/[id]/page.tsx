'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BlockEditor, { type DraftBlock } from '@/components/admin/journal/BlockEditor';
import EditorShell, { Panel } from '@/components/admin/EditorShell';
import MediaPicker from '@/components/admin/MediaPicker';
import {
  Field,
  Select,
  TagInput,
  TextArea,
  TextInput,
  Toggle,
} from '@/components/admin/Fields';
import { useToast } from '@/components/admin/Toast';
import { getBrowserClient } from '@/lib/supabase/client';
import { loadPost, savePost, type PostMeta } from '@/lib/admin/journalStore';
import { JOURNAL_CATEGORIES, slugify } from '@/lib/types/journal';
import type { JournalCategory } from '@/lib/types/database';

const emptyMeta: PostMeta = {
  title: '',
  slug: '',
  excerpt: '',
  cover_image_url: null,
  cover_alt: '',
  cover_width: null,
  cover_height: null,
  cover_focal_x: 0.5,
  cover_focal_y: 0.5,
  category: 'Life',
  tags: [],
  published_at: null,
  status: 'draft',
  featured: false,
};

export default function AdminJournalEditorPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const router = useRouter();
  const { toast } = useToast();

  const [meta, setMeta] = useState<PostMeta>(emptyMeta);
  const [blocks, setBlocks] = useState<DraftBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const baseline = useRef('');

  const dirty = useMemo(
    () => JSON.stringify({ meta, blocks }) !== baseline.current,
    [meta, blocks],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const supabase = getBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const loaded = await loadPost(supabase, postId);
      if (cancelled) return;

      if (!loaded) {
        toast('找不到這篇文章。', 'error');
        router.replace('/admin/journal');
        return;
      }

      setMeta(loaded.meta);
      setBlocks(loaded.blocks);
      baseline.current = JSON.stringify({ meta: loaded.meta, blocks: loaded.blocks });
      setLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [postId, router, toast]);

  const patch = <K extends keyof PostMeta>(key: K, value: PostMeta[K]) =>
    setMeta((current) => ({ ...current, [key]: value }));

  const save = useCallback(async () => {
    const supabase = getBrowserClient();
    if (!supabase) return;

    if (!meta.slug.trim()) {
      toast('Slug 不能空白。', 'error');
      return;
    }

    setSaving(true);
    const error = await savePost(supabase, postId, meta, blocks);
    setSaving(false);

    if (error) {
      toast(`儲存失敗：${error}`, 'error');
      return;
    }

    // 重新讀取，讓新建立的區塊與 gallery 取得資料庫 id
    const reloaded = await loadPost(supabase, postId);
    if (reloaded) {
      setMeta(reloaded.meta);
      setBlocks(reloaded.blocks);
      baseline.current = JSON.stringify({
        meta: reloaded.meta,
        blocks: reloaded.blocks,
      });
    }
    toast('Saved successfully.');
  }, [blocks, meta, postId, toast]);

  return (
    <EditorShell
      title={meta.title || 'Untitled'}
      description={`/journal/${meta.slug || '…'}`}
      dirty={dirty}
      saving={saving}
      onSave={() => void save()}
      actions={
        meta.status === 'published' && meta.slug ? (
          <a
            href={`/journal/${meta.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-ink/55 transition-colors duration-300 hover:text-coffee"
          >
            View ↗
          </a>
        ) : null
      }
    >
      {loading ? (
        <p className="font-sans text-sm text-ink/40">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* 內容區塊 */}
          <div className="xl:col-span-2">
            <Panel title="Content" description="文章由區塊組成，可自由排列">
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </Panel>
          </div>

          {/* 側邊設定 */}
          <div className="space-y-6">
            <Panel title="Post">
              <div className="space-y-4">
                <Field label="Title">
                  <TextInput
                    value={meta.title}
                    onChange={(value) => {
                      patch('title', value);
                      // slug 還是預設值時，跟著標題自動更新
                      if (!meta.slug || meta.slug.startsWith('untitled-')) {
                        patch('slug', slugify(value));
                      }
                    }}
                  />
                </Field>

                <Field label="Slug" hint="網址用，只能是英數與連字號">
                  <TextInput
                    value={meta.slug}
                    onChange={(value) => patch('slug', value)}
                  />
                </Field>

                <Field label="Excerpt" hint="列表與分享預覽會用到">
                  <TextArea
                    value={meta.excerpt}
                    onChange={(value) => patch('excerpt', value)}
                    rows={4}
                  />
                </Field>

                <Field label="Category">
                  <Select
                    value={meta.category}
                    onChange={(value) => patch('category', value as JournalCategory)}
                    options={JOURNAL_CATEGORIES.map((c) => ({ value: c, label: c }))}
                  />
                </Field>

                <Field label="Tags" hint="輸入後按 Enter">
                  <TagInput
                    values={meta.tags}
                    onChange={(values) => patch('tags', values)}
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Cover Image">
              <div className="space-y-3">
                <div className="overflow-hidden border border-ink/15 bg-sand">
                  {meta.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={meta.cover_image_url}
                      alt=""
                      className="w-full object-contain"
                    />
                  ) : (
                    <div className="flex aspect-[3/2] items-center justify-center">
                      <span className="label-text text-ink/30">NO COVER</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCoverPickerOpen(true)}
                    className="border border-ink/20 px-4 py-2 font-sans text-sm text-ink transition-colors duration-300 hover:border-coffee hover:text-coffee"
                  >
                    {meta.cover_image_url ? 'Replace' : 'Choose'}
                  </button>
                  {meta.cover_image_url && (
                    <button
                      type="button"
                      onClick={() => {
                        patch('cover_image_url', null);
                        patch('cover_width', null);
                        patch('cover_height', null);
                      }}
                      className="border border-ink/20 px-4 py-2 font-sans text-sm text-ink/70 transition-colors duration-300 hover:border-red-800/40 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {meta.cover_width && meta.cover_height && (
                  <p className="font-sans text-xs text-ink/40">
                    {meta.cover_width}×{meta.cover_height}
                  </p>
                )}

                <Field label="Cover Alt">
                  <TextInput
                    value={meta.cover_alt}
                    onChange={(value) => patch('cover_alt', value)}
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Publish">
              <div className="space-y-3">
                <Toggle
                  checked={meta.status === 'published'}
                  onChange={(checked) => patch('status', checked ? 'published' : 'draft')}
                  label={meta.status === 'published' ? 'Published' : 'Draft'}
                  description={
                    meta.status === 'published'
                      ? '公開網站可以看到'
                      : '只有你在後台看得到'
                  }
                />
                <Toggle
                  checked={meta.featured}
                  onChange={(checked) => patch('featured', checked)}
                  label="Featured"
                  description="首頁 Latest Stories 優先顯示"
                />
                <Field label="Published Date" hint="留空會在首次發佈時自動填入">
                  <TextInput
                    type="date"
                    value={meta.published_at ? meta.published_at.slice(0, 10) : ''}
                    onChange={(value) =>
                      patch(
                        'published_at',
                        value ? new Date(`${value}T00:00:00`).toISOString() : null,
                      )
                    }
                  />
                </Field>
              </div>
            </Panel>
          </div>
        </div>
      )}

      <MediaPicker
        open={coverPickerOpen}
        mode="single"
        title="Choose cover image"
        onClose={() => setCoverPickerOpen(false)}
        onSelect={(media) => {
          const item = media[0];
          if (!item) return;
          patch('cover_image_url', item.public_url);
          patch('cover_width', item.width);
          patch('cover_height', item.height);
          patch('cover_focal_x', Number(item.focal_x ?? 0.5));
          patch('cover_focal_y', Number(item.focal_y ?? 0.5));
          if (!meta.cover_alt && item.alt) patch('cover_alt', item.alt);
        }}
      />
    </EditorShell>
  );
}
