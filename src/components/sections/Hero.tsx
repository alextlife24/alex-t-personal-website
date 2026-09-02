import Figure from '@/components/ui/Figure';
import Reveal from '@/components/ui/Reveal';
import { hero } from '@/data/hero';

/**
 * 首頁第一屏。保持乾淨：左側文字、右側大型直式影像（4:5）。
 * 文字內容在 src/data/hero.ts。
 */
export default function Hero() {
  return (
    <section id="top" className="relative pt-28 sm:pt-32 lg:pt-40">
      <div className="shell">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12">
          {/* 左側：文字 */}
          <div className="lg:col-span-5 lg:pt-10">
            <Reveal duration={0.6}>
              <p className="label-text text-coffee">{hero.eyebrow}</p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-7 font-serif text-[2.75rem] leading-[1.08] tracking-[-0.01em] text-ink sm:text-6xl lg:text-[4.25rem]">
                {hero.titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-8 max-w-prose2 font-tc text-[0.9375rem] leading-[2] text-ink/70">
                {hero.bodyLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <a
                href={hero.cta.href}
                className="group mt-12 inline-flex items-center gap-2 border-b border-ink/25 pb-1.5 font-sans text-sm tracking-wide text-ink transition-colors duration-400 ease-editorial hover:border-coffee hover:text-coffee"
              >
                {hero.cta.label}
                <span
                  aria-hidden
                  className="transition-transform duration-400 ease-editorial group-hover:translate-y-1"
                >
                  ↓
                </span>
              </a>
            </Reveal>
          </div>

          {/* 右側：大型 Lifestyle 影像（雜誌感直式構圖，非 16:9） */}
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.1} duration={0.9} y={24} as="figure" className="group">
              <Figure
                src={hero.image}
                alt={hero.imageAlt}
                ratio="aspect-[4/5]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <figcaption className="mt-4 flex items-center justify-between font-sans text-xs text-ink/40">
                <span>{hero.imageCaption}</span>
                <span className="label-text">2026</span>
              </figcaption>
            </Reveal>
          </div>
        </div>
      </div>

      {/* 底部關鍵字列 */}
      <div className="shell mt-20 sm:mt-24 lg:mt-28">
        <Reveal delay={0.1}>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink/10 pt-6">
            {hero.keywords.map((word) => (
              <li key={word} className="label-text text-ink/45">
                {word}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
