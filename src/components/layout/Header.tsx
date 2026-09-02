'use client';

import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import MobileMenu from '@/components/layout/MobileMenu';
import { contactAnchor, navItems } from '@/data/navigation';
import { site } from '@/data/site';
import { cn } from '@/lib/utils';

/** Sticky Header。捲動後加上極輕微底色與模糊，不做明顯玻璃擬態。 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-colors duration-500 ease-editorial',
          scrolled
            ? 'border-b border-ink/10 bg-paper/85 backdrop-blur-[6px]'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="shell flex h-20 items-center justify-between gap-6">
          <a
            href="#top"
            className="font-serif text-xl tracking-tight text-ink transition-colors duration-300 hover:text-coffee sm:text-[1.375rem]"
          >
            {site.name}
          </a>

          <nav aria-label="主要導覽" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group relative inline-block py-1 font-sans text-[0.8125rem] tracking-wide text-ink/70 transition-colors duration-400 hover:text-ink"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-0 h-px w-0 bg-coffee transition-[width] duration-400 ease-editorial group-hover:w-full"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={contactAnchor.href}
              className="group hidden items-center gap-1.5 border border-ink/15 px-4 py-2 font-sans text-[0.8125rem] tracking-wide text-ink transition-colors duration-400 ease-editorial hover:border-coffee hover:text-coffee lg:inline-flex"
            >
              {contactAnchor.label}
              <span
                aria-hidden
                className="transition-transform duration-400 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="開啟選單"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="-mr-2 p-2 text-ink transition-colors duration-300 hover:text-coffee lg:hidden"
            >
              <Menu strokeWidth={1.25} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
