import { ArrowUpRight, Github, Instagram, Mail, MapPin } from 'lucide-react';
import type { SocialItem } from '@/lib/types/content';

/**
 * Lucide 沒有 TikTok / X / Threads 的官方品牌圖示，
 * 因此這些平台只用「文字 ＋ 箭頭」呈現，不套用錯誤的品牌圖示。
 */
const icons = {
  instagram: Instagram,
  github: Github,
  mail: Mail,
  map: MapPin,
} as const;

export default function SocialLink({ item }: { item: SocialItem }) {
  const Icon = item.icon ? icons[item.icon] : null;
  const externalProps = item.external
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <a
      href={item.href}
      {...externalProps}
      className="group flex items-center justify-between gap-6 border-b border-ink/10 py-5 transition-colors duration-400 ease-editorial hover:border-coffee/40"
    >
      <span className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <Icon
            aria-hidden
            strokeWidth={1.25}
            className="h-4 w-4 shrink-0 text-ink/40 transition-colors duration-400 group-hover:text-coffee"
          />
        ) : (
          <span aria-hidden className="h-4 w-4 shrink-0" />
        )}
        <span className="min-w-0">
          <span className="block font-serif text-xl text-ink transition-colors duration-400 group-hover:text-coffee sm:text-2xl">
            {item.name}
          </span>
          <span className="mt-0.5 block truncate font-sans text-xs text-ink/45">
            {item.handle}
          </span>
        </span>
      </span>
      <ArrowUpRight
        aria-hidden
        strokeWidth={1.25}
        className="h-4 w-4 shrink-0 text-ink/35 transition-all duration-400 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coffee"
      />
    </a>
  );
}
