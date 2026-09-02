'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/admin/Toast';
import { getBrowserClient } from '@/lib/supabase/client';

type SingletonTable = 'site_settings' | 'home_content' | 'about_content';

/**
 * 管理「只有一列」的設定表（Home / About / Site Settings）。
 *
 * 表內沒有資料時會自動以 defaults 建立第一列，
 * 因此第一次進入後台不需要先手動 seed。
 */
export function useSingleton<T extends Record<string, unknown>>(
  table: SingletonTable,
  defaults: T,
) {
  const { toast } = useToast();
  const [form, setForm] = useState<T>(defaults);
  const [rowId, setRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const baseline = useRef<string>(JSON.stringify(defaults));

  const dirty = useMemo(
    () => JSON.stringify(form) !== baseline.current,
    [form],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const supabase = getBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        toast(`讀取失敗：${error.message}`, 'error');
        setLoading(false);
        return;
      }

      if (data) {
        const next = { ...defaults };
        for (const key of Object.keys(defaults) as (keyof T)[]) {
          const value = (data as Record<string, unknown>)[key as string];
          if (value !== undefined && value !== null) {
            next[key] = value as T[keyof T];
          }
        }
        setRowId((data as { id: string }).id);
        setForm(next);
        baseline.current = JSON.stringify(next);
      }

      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
    // defaults 只在第一次掛載時使用，刻意不列入相依
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const update = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    const supabase = getBrowserClient();
    if (!supabase) {
      toast('尚未設定 Supabase，無法儲存。', 'error');
      return;
    }

    setSaving(true);

    const payload = form as Record<string, unknown>;
    // 泛型 table 讓 supabase-js 推導出聯集型別，這裡以 never 明確放行
    const { data, error } = rowId
      ? await supabase.from(table).update(payload as never).eq('id', rowId).select().single()
      : await supabase.from(table).insert(payload as never).select().single();

    setSaving(false);

    if (error) {
      toast(`儲存失敗：${error.message}`, 'error');
      return;
    }

    if (data && !rowId) setRowId((data as { id: string }).id);
    baseline.current = JSON.stringify(form);
    // 觸發 dirty 重新計算
    setForm((current) => ({ ...current }));
    toast('Saved successfully.');
  }, [form, rowId, table, toast]);

  return { form, update, setForm, dirty, loading, saving, save };
}
