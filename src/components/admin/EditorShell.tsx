'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** 離開頁面前提醒尚未儲存的變更。 */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}

type EditorShellProps = {
  title: string;
  description?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * 編輯頁的共用外框。
 * 右上角固定 Save Changes，並在有未儲存變更時顯示 Unsaved changes。
 */
export default function EditorShell({
  title,
  description,
  dirty,
  saving,
  onSave,
  actions,
  children,
}: EditorShellProps) {
  useUnsavedChanges(dirty);

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-5 border-b border-ink/10 bg-paper/95 px-5 py-4 backdrop-blur-[6px] sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl leading-tight text-ink sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 font-sans text-xs text-ink/45">{description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {dirty && (
              <span className="inline-flex items-center gap-1.5 font-sans text-xs text-coffee">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-coffee" />
                Unsaved changes
              </span>
            )}
            {actions}
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !dirty}
              className={cn(
                'px-5 py-2.5 font-sans text-sm transition-colors duration-300',
                dirty
                  ? 'bg-ink text-paper hover:bg-coffee'
                  : 'cursor-not-allowed border border-ink/15 text-ink/35',
              )}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="py-8">{children}</div>
    </div>
  );
}

/** 編輯頁內的區塊卡片 */
export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border border-ink/10 bg-paper p-5 sm:p-6', className)}>
      {title && (
        <header className="mb-5 border-b border-ink/10 pb-4">
          <h2 className="font-serif text-xl text-ink">{title}</h2>
          {description && (
            <p className="mt-1 font-sans text-xs text-ink/45">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
