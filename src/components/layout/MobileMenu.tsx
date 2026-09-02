'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { contactAnchor, navItems } from '@/data/navigation';
import { site } from '@/data/site';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

/** 手機版全螢幕選單。乾淨、無裝飾，關閉時鎖住背景捲動。 */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="網站選單"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col bg-paper lg:hidden"
        >
          <div className="shell flex h-20 items-center justify-between">
            <span className="font-serif text-xl tracking-tight">{site.name}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉選單"
              className="-mr-2 p-2 text-ink/70 transition-colors duration-300 hover:text-coffee"
            >
              <X strokeWidth={1.25} className="h-5 w-5" />
            </button>
          </div>

          <nav className="shell flex flex-1 flex-col justify-center pb-24">
            <ul className="space-y-1">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.05 + index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="border-b border-ink/10"
                >
                  <a
                    href={item.href}
                    onClick={onClose}
                    className="flex items-baseline gap-4 py-4"
                  >
                    <span className="label-text text-coffee/60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-3xl text-ink">{item.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <a
              href={contactAnchor.href}
              onClick={onClose}
              className="mt-10 inline-flex items-center gap-2 self-start border-b border-coffee/40 pb-1 font-sans text-sm tracking-wide text-coffee"
            >
              {contactAnchor.label}
              <span aria-hidden>↗</span>
            </a>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
