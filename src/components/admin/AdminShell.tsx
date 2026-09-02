'use client';

import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ToastProvider } from '@/components/admin/Toast';
import { adminNav, studio } from '@/lib/admin/navigation';
import { getBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

/**
 * 後台外框。
 * Desktop：左側固定 Sidebar；Mobile：Drawer Menu。
 * 延續前台的暖色 Editorial 調性，不做企業風 Dashboard。
 */
export default function AdminShell({
  email,
  children,
}: {
  email: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 換頁時自動關閉 Drawer
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const signOut = async () => {
    const supabase = getBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-paper">
      <div className="border-b border-paper/10 px-6 py-6">
        <p className="font-serif text-xl tracking-tight">{studio.name}</p>
        <p className="mt-1 font-sans text-[0.6875rem] uppercase tracking-label text-paper/40">
          {studio.subtitle}
        </p>
      </div>

      <nav aria-label="後台導覽" className="flex-1 overflow-y-auto px-3 py-5">
        {adminNav.map((group, groupIndex) => (
          <div key={group.title ?? `group-${groupIndex}`} className={groupIndex > 0 ? 'mt-6' : ''}>
            {group.title && (
              <p className="px-3 pb-2 font-sans text-[0.625rem] uppercase tracking-label text-paper/30">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'block px-3 py-2 font-sans text-sm transition-colors duration-300',
                        active
                          ? 'bg-paper/10 text-paper'
                          : 'text-paper/55 hover:bg-paper/5 hover:text-paper/90',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-paper/10 px-3 py-4">
        {email && (
          <p className="truncate px-3 pb-3 font-sans text-xs text-paper/35">{email}</p>
        )}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between px-3 py-2 font-sans text-sm text-paper/55 transition-colors duration-300 hover:text-paper"
        >
          View Website
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </a>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 px-3 py-2 font-sans text-sm text-paper/55 transition-colors duration-300 hover:text-paper"
        >
          <LogOut aria-hidden strokeWidth={1.5} className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">{sidebar}</aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="關閉選單"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-ink/40"
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="關閉選單"
                className="absolute right-3 top-5 z-10 p-2 text-paper/60 transition-colors hover:text-paper"
              >
                <X aria-hidden strokeWidth={1.5} className="h-5 w-5" />
              </button>
              {sidebar}
            </div>
          </div>
        )}

        <div className="lg:pl-60">
          {/* Mobile header */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink/10 bg-paper/95 px-5 py-3 backdrop-blur-[6px] lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="開啟後台選單"
              className="-ml-2 p-2 text-ink transition-colors hover:text-coffee"
            >
              <Menu aria-hidden strokeWidth={1.5} className="h-5 w-5" />
            </button>
            <span className="font-serif text-lg tracking-tight text-ink">{studio.name}</span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-ink/55 transition-colors hover:text-coffee"
            >
              Preview ↗
            </a>
          </header>

          {/* Desktop header */}
          <header className="hidden items-center justify-end border-b border-ink/10 px-8 py-3 lg:flex">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 font-sans text-sm text-ink/60 transition-colors duration-300 hover:text-coffee"
            >
              Preview Website
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </a>
          </header>

          <main className="px-5 pb-20 sm:px-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
