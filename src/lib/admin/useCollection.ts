'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/admin/Toast';
import { getBrowserClient } from '@/lib/supabase/client';
import type { ContentTable } from '@/lib/types/database';

type WithId = { id: string; sort_order?: number };

/**
 * 集合型內容（Coffee / Places / Photos / Technology / Projects）的共用 CRUD。
 * 所有刪除都由呼叫端先跳確認對話框，這裡只負責實際執行。
 */
export function useCollection<T extends WithId>(
  table: ContentTable,
  orderBy: { column: string; ascending: boolean }[] = [
    { column: 'sort_order', ascending: true },
    { column: 'created_at', ascending: false },
  ],
) {
  const { toast } = useToast();
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = getBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let query = supabase.from(table).select('*');
    for (const order of orderBy) {
      query = query.order(order.column, { ascending: order.ascending });
    }

    const { data, error } = await query;

    if (error) {
      toast(`讀取失敗：${error.message}`, 'error');
    } else {
      setRows((data ?? []) as unknown as T[]);
    }
    setLoading(false);
    // orderBy 是常數陣列，不列入相依避免無限迴圈
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: Record<string, unknown>) => {
      const supabase = getBrowserClient();
      if (!supabase) {
        toast('尚未設定 Supabase，無法新增。', 'error');
        return null;
      }

      setBusy(true);
      // 泛型 table 讓 supabase-js 推導出聯集型別，這裡以 never 明確放行
      const { data, error } = await supabase
        .from(table)
        .insert(payload as never)
        .select()
        .single();
      setBusy(false);

      if (error) {
        toast(`新增失敗：${error.message}`, 'error');
        return null;
      }

      await refresh();
      toast('Saved successfully.');
      return data as unknown as T;
    },
    [table, refresh, toast],
  );

  const update = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      const supabase = getBrowserClient();
      if (!supabase) {
        toast('尚未設定 Supabase，無法儲存。', 'error');
        return false;
      }

      setBusy(true);
      const { error } = await supabase.from(table).update(payload as never).eq('id', id);
      setBusy(false);

      if (error) {
        toast(`儲存失敗：${error.message}`, 'error');
        return false;
      }

      await refresh();
      toast('Saved successfully.');
      return true;
    },
    [table, refresh, toast],
  );

  const remove = useCallback(
    async (id: string) => {
      const supabase = getBrowserClient();
      if (!supabase) {
        toast('尚未設定 Supabase，無法刪除。', 'error');
        return false;
      }

      setBusy(true);
      const { error } = await supabase.from(table).delete().eq('id', id);
      setBusy(false);

      if (error) {
        toast(`刪除失敗：${error.message}`, 'error');
        return false;
      }

      await refresh();
      toast('Deleted.');
      return true;
    },
    [table, refresh, toast],
  );

  /** 依照目前陣列順序寫回 sort_order */
  const persistOrder = useCallback(
    async (ordered: T[]) => {
      const supabase = getBrowserClient();
      if (!supabase) return;

      setRows(ordered);
      const updates = ordered.map((row, index) =>
        supabase.from(table).update({ sort_order: index } as never).eq('id', row.id),
      );
      const results = await Promise.all(updates);
      const failed = results.find((result) => result.error);

      if (failed?.error) {
        toast(`排序儲存失敗：${failed.error.message}`, 'error');
        await refresh();
        return;
      }
      toast('Order updated.');
    },
    [table, refresh, toast],
  );

  return { rows, loading, busy, refresh, create, update, remove, persistOrder, setRows };
}
