'use client';

import { useEffect } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * 刪除前的確認對話框。
 * 所有刪除動作都必須經過這一步，不會點一次就直接刪除。
 */
export default function ConfirmDialog({
  open,
  title,
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
    >
      <div className="w-full max-w-md border border-ink/15 bg-paper p-6 shadow-lg">
        <h2 id="confirm-title" className="font-serif text-2xl text-ink">
          {title}
        </h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-ink/60">{description}</p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="border border-ink/20 px-5 py-2.5 font-sans text-sm text-ink transition-colors duration-300 hover:border-ink/40 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="bg-red-900 px-5 py-2.5 font-sans text-sm text-paper transition-colors duration-300 hover:bg-red-800 disabled:opacity-50"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
