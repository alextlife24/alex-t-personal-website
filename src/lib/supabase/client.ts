'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';
import type { Database } from '@/lib/types/database';

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * 瀏覽器端 Supabase client（後台使用）。
 * 未設定環境變數時回傳 null，呼叫端需自行處理。
 */
export function getBrowserClient() {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return cached;
}
