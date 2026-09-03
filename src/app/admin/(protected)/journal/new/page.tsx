'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/admin/Toast';
import { getBrowserClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/types/journal';

/**
 * /admin/journal/new
 * 建立一篇空白草稿後直接導向編輯器，不停在中間頁。
 */
export default function AdminJournalNewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // React 18 的 StrictMode 會執行兩次 effect，用 ref 擋住第二次
    if (started.current) return;
    started.current = true;

    const run = async () => {
      const supabase = getBrowserClient();
      if (!supabase) {
        setError('尚未設定 Supabase。');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('journal_posts')
        .insert({
          title: 'Untitled',
          slug: slugify(`untitled-${Date.now()}`),
          status: 'draft',
          category: 'Life',
        })
        .select()
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? '建立失敗');
        toast(`建立失敗：${insertError?.message}`, 'error');
        return;
      }

      router.replace(`/admin/journal/${data.id}`);
    };

    void run();
  }, [router, toast]);

  return (
    <div className="py-16">
      {error ? (
        <div className="max-w-md">
          <p className="font-serif text-2xl text-ink">無法建立新文章</p>
          <p className="mt-3 font-sans text-sm text-ink/55">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/admin/journal')}
            className="mt-6 border border-ink/20 px-4 py-2 font-sans text-sm text-ink transition-colors hover:border-coffee hover:text-coffee"
          >
            回到 Journal 列表
          </button>
        </div>
      ) : (
        <p className="font-sans text-sm text-ink/40">正在建立新文章…</p>
      )}
    </div>
  );
}
