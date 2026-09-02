import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';
import type { Database } from '@/lib/types/database';

/**
 * Server Component / Route Handler 使用的 Supabase client。
 * 使用官方推薦的 @supabase/ssr，不使用已淘汰的 auth-helpers。
 *
 * 未設定環境變數時回傳 null，呼叫端會退回 src/data 的靜態內容。
 */
export async function getServerClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // 在 Server Component 中呼叫 set 會拋錯，
          // 由 middleware 負責更新 session cookie，這裡忽略即可。
        }
      },
    },
  });
}

/** 取得目前登入的管理者，未登入回傳 null。 */
export async function getCurrentUser() {
  const supabase = await getServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
