'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { ListHeader } from '@/components/admin/RecordDrawer';
import { FeaturedBadge, StatusBadge } from '@/components/admin/Fields';
import { useToast } from '@/components/admin/Toast';
import { getBrowserClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/types/journal';
import type { JournalPostRow } from '@/lib/types/database';

export default function AdminJournalListPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [rows, setRows] = useState<JournalPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JournalPostRow | null>(null);

  const refresh = useCallback(async () => {
    const supabase = getBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('journal_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: true })
      .order('created_at', { ascending: false });

    if (error) toast(`讀取失敗：${error.message}`, 'error');
    else setRows(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createPost = async () => {
    const supabase = getBrowserClient();
    if (!supabase) return;

    setBusy(true);
    const { data, error } = await supabase
      .from('journal_posts')
      .insert({
        title: 'Untitled',
        slug: slugify(`untitled-${Date.now()}`),
        status: 'draft',
        category: 'Life',
      })
      .select()
      .single();
    setBusy(false);

    if (error || !data) {
      toast(`建立失敗：${error?.message}`, 'error');
      return;
    }
    router.push(`/admin/journal/${data.id}`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    setBusy(true);
    const { error } = await supabase
      .from('journal_posts')
      .delete()
      .eq('id', deleteTarget.id);
    setBusy(false);
    setDeleteTarget(null);

    if (error) {
      toast(`刪除失敗：${error.message}`, 'error');
      return;
    }
    await refresh();
    toast('Deleted.');
  };

  return (
    <>
      <ListHeader
        title="Journal"
        description="文章、遊記與咖啡筆記"
        actionLabel={busy ? 'Creating…' : 'New Post'}
        onAction={() => void createPost()}
      />

      <div className="py-8">
        {loading ? (
          <p className="font-sans text-sm text-ink/40">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="border border-dashed border-ink/15 p-8 text-center font-sans text-sm text-ink/40">
            還沒有文章。按右上角的 New Post 開始寫第一篇。
          </p>
        ) : (
          <ul className="border-t border-ink/10">
            {rows.map((post) => (
              <li key={post.id} className="border-b border-ink/10">
                <div className="group flex flex-wrap items-center gap-x-5 gap-y-2 py-4 transition-colors duration-300 hover:bg-sand">
                  <Link
                    href={`/admin/journal/${post.id}`}
                    className="min-w-0 flex-1 pr-2"
                  >
                    <span className="block font-serif text-lg text-ink group-hover:text-coffee sm:text-xl">
                      {post.title}
                    </span>
                    <span className="mt-1 block font-sans text-xs text-ink/40">
                      /journal/{post.slug}
                    </span>
                  </Link>

                  <span className="w-24 shrink-0 font-sans text-xs text-ink/50">
                    {post.category}
                  </span>
                  <span className="w-24 shrink-0 font-sans text-xs text-ink/40">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('zh-TW')
                      : '—'}
                  </span>

                  <span className="flex shrink-0 items-center gap-2">
                    <StatusBadge published={post.status === 'published'} />
                    <FeaturedBadge featured={post.featured} />
                  </span>

                  <span className="flex shrink-0 items-center gap-3">
                    {post.status === 'published' && (
                      <a
                        href={`/journal/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-xs text-ink/45 transition-colors hover:text-coffee"
                      >
                        View ↗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(post)}
                      className="font-sans text-xs text-ink/40 transition-colors hover:text-red-800"
                    >
                      Delete
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this post?"
        description="文章與其所有區塊、Gallery 都會被刪除。已上傳的圖片仍保留在 Media Library。"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
