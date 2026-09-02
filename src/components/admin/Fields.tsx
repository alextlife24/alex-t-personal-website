'use client';

import { GripVertical, Plus, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const inputClass =
  'w-full border border-ink/15 bg-paper px-3 py-2.5 font-sans text-sm text-ink outline-none transition-colors duration-300 placeholder:text-ink/30 focus:border-coffee';

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="label-text block text-ink/45">{label}</span>
      {hint && <span className="mt-1 block font-sans text-xs text-ink/35">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'email' | 'date' | 'number' | 'password';
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cn(inputClass, 'resize-y leading-relaxed')}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(inputClass, 'cursor-pointer')}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 border border-ink/15 bg-paper px-3 py-2.5 text-left transition-colors duration-300 hover:border-ink/30"
    >
      <span className="min-w-0">
        <span className="block font-sans text-sm text-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block font-sans text-xs text-ink/40">{description}</span>
        )}
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300',
          checked ? 'bg-sage' : 'bg-beige',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-all duration-300',
            checked ? 'left-[1.125rem]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}

/**
 * Tag 編輯器：新增、刪除、上下移動排序。
 * 用於 Interest Tags、Flavor Notes、Technologies、Keywords。
 */
export function TagInput({
  values,
  onChange,
  placeholder = 'Add a tag and press Enter',
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const next = draft.trim();
    if (!next || values.includes(next)) {
      setDraft('');
      return;
    }
    onChange([...values, next]);
    setDraft('');
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          aria-label="新增標籤"
          className="shrink-0 border border-ink/15 px-3 text-ink/60 transition-colors duration-300 hover:border-coffee hover:text-coffee"
        >
          <Plus aria-hidden strokeWidth={1.5} className="h-4 w-4" />
        </button>
      </div>

      {values.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {values.map((value, index) => (
            <li
              key={`${value}-${index}`}
              className="flex items-center gap-2 border border-ink/10 bg-sand/60 px-3 py-2"
            >
              <GripVertical aria-hidden strokeWidth={1.5} className="h-4 w-4 shrink-0 text-ink/25" />
              <span className="min-w-0 flex-1 truncate font-sans text-sm text-ink">{value}</span>
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="上移"
                className="px-1 font-sans text-xs text-ink/40 transition-colors hover:text-coffee disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === values.length - 1}
                aria-label="下移"
                className="px-1 font-sans text-xs text-ink/40 transition-colors hover:text-coffee disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`刪除 ${value}`}
                className="px-1 text-ink/35 transition-colors hover:text-red-800"
              >
                <X aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center border px-2 py-0.5 text-[0.625rem] uppercase tracking-label',
        published
          ? 'border-sage/40 bg-sage/10 text-sage'
          : 'border-ink/15 bg-ink/5 text-ink/45',
      )}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

export function FeaturedBadge({ featured }: { featured: boolean }) {
  if (!featured) return null;
  return (
    <span className="inline-flex shrink-0 items-center border border-coffee/30 bg-coffee/10 px-2 py-0.5 text-[0.625rem] uppercase tracking-label text-coffee">
      Featured
    </span>
  );
}
