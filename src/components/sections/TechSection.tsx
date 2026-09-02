import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import type { TechContent } from '@/lib/types/content';

/**
 * 05 / AI & TECH。
 * 視覺比其他區塊略為現代（等寬字標籤、細框卡片），
 * 但仍維持全站的暖色 Editorial 調性，不使用科技藍。
 */
export default function TechSection({ tech }: { tech: TechContent }) {
  return (
    <section id="tech" className="section-space">
      <div className="shell">
        <Reveal>
          <SectionLabel index={tech.label.index} title={tech.label.title} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal delay={0.05}>
              <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] text-ink sm:text-5xl">
                {tech.heading}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
            {tech.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph} delay={0.08 + index * 0.05}>
                <p className="font-tc text-[0.9375rem] leading-[2] text-ink/70">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-ink/10 bg-ink/10 lg:mt-24 lg:grid-cols-3">
          {tech.cards.map((card, index) => (
            <Reveal
              as="li"
              key={card.id}
              delay={0.05 * index}
              className="group flex flex-col bg-paper p-8 transition-colors duration-600 ease-editorial hover:bg-sand sm:p-10"
            >
              <span className="label-text text-coffee">{card.id}</span>

              <h3 className="mt-8 font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]">
                {card.title}
              </h3>

              <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-label text-sage">
                {card.stack}
              </p>

              <p className="mt-6 font-tc text-[0.9375rem] leading-[2] text-ink/70">
                {card.body}
              </p>

              <span
                aria-hidden
                className="mt-8 block h-px w-8 bg-ink/20 transition-all duration-600 ease-editorial group-hover:w-16 group-hover:bg-coffee"
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
