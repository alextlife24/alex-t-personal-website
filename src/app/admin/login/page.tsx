import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/admin/LoginForm';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { studio } from '@/lib/admin/navigation';

export const metadata: Metadata = {
  title: { absolute: `Sign in — ${studio.name}` },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * /admin/login
 * 只提供登入，沒有註冊功能 —— 管理員帳號一律在 Supabase Dashboard 建立。
 */
export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* 左側：識別 */}
      <div className="flex flex-col justify-between bg-ink px-8 py-12 text-paper sm:px-12 lg:py-16">
        <p className="font-serif text-2xl tracking-tight">{studio.name}</p>

        <div className="py-16 lg:py-0">
          <p className="label-text text-paper/40">{studio.subtitle}</p>
          <p className="mt-6 max-w-sm font-serif text-3xl leading-snug text-paper/90 sm:text-4xl">
            A quiet place to manage Coffee, Places, Photos and Ideas.
          </p>
        </div>

        <p className="font-sans text-xs text-paper/30">© 2026 Alex T.</p>
      </div>

      {/* 右側：登入卡 */}
      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Welcome back</h1>

          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <div className="mt-8 border border-coffee/25 bg-sand p-5">
              <p className="font-sans text-sm font-medium text-ink">
                尚未設定 Supabase
              </p>
              <p className="mt-2 font-sans text-xs leading-relaxed text-ink/60">
                請在專案根目錄建立 <code className="text-coffee">.env.local</code>，
                填入 <code className="text-coffee">NEXT_PUBLIC_SUPABASE_URL</code> 與{' '}
                <code className="text-coffee">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>，
                然後重新啟動開發伺服器。詳細步驟見 README 的「Alex T Studio」章節。
              </p>
              <p className="mt-3 font-sans text-xs leading-relaxed text-ink/60">
                前台網站不受影響，仍會使用 <code className="text-coffee">src/data</code> 的內容正常顯示。
              </p>
            </div>
          )}

          <Link
            href="/"
            className="group mt-10 inline-flex items-center gap-2 font-sans text-sm text-ink/55 transition-colors duration-300 hover:text-coffee"
          >
            Return to website
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
