'use client';

import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Plus } from 'lucide-react';

/** 列表頁的標題列：左側標題，右側 New 按鈕。 */
export function ListHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
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

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 font-sans text-sm text-paper transition-colors duration-300 hover:bg-coffee"
          >
            <Plus aria-hidden strokeWidth={1.5} className="h-4 w-4" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

type RecordDrawerProps = {
  open: boolean;
  title: string;
  saving?: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  children: ReactNode;
};

/**
 * 新增 / 編輯用的側邊面板。
 * 手機上為全螢幕，桌機為右側 slide-over，避免表格橫向捲動。
 */
export default function RecordDrawer({
  open,
  title,
  saving = false,
  onClose,
  onSave,
  onDelete,
  children,
}: RecordDrawerProps) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55]">
      <button
        type="button"
        aria-label="關閉"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-paper shadow-xl">
        <header className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 sm:px-6">
          <h2 className="min-w-0 truncate font-serif text-xl text-ink sm:text-2xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="-mr-2 p-2 text-ink/50 transition-colors hover:text-coffee"
          >
            <X aria-hidden strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">{children}</div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-5 py-4 sm:px-6">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="font-sans text-sm text-ink/50 transition-colors duration-300 hover:text-red-800"
            >
              Delete
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-ink/20 px-4 py-2.5 font-sans text-sm text-ink transition-colors duration-300 hover:border-ink/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="bg-ink px-5 py-2.5 font-sans text-sm text-paper transition-colors duration-300 hover:bg-coffee disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
