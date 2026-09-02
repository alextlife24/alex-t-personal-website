import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { getCurrentUser } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { studio } from '@/lib/admin/navigation';

export const metadata: Metadata = {
  title: { default: studio.name, template: `%s — ${studio.name}` },
  description: studio.tagline,
  robots: { index: false, follow: false },
};

/** 後台一律動態渲染，確保每次都重新驗證登入狀態。 */
export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware 已擋過一層，這裡是第二道防線（defence in depth）
  if (!isSupabaseConfigured) redirect('/admin/login');

  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  return <AdminShell email={user.email ?? null}>{children}</AdminShell>;
}
