import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import type { TechContent } from '@/lib/types/content';

/**
 * 05 / AI & TECH
 *
 * 視覺節奏：極簡排版式清單。
 * 這一區刻意完全不放圖片與卡片框，只用文字層級與細線區隔，
 * 讓它在整頁的照片節奏中形成一個安靜的停頓。
 */
export default function TechSection({ tech }: { tech: TechContent }) {
  return (
    <section id="tech" className="section-space">
      <div className="shell">
        <Reveal>
          <SectionLabel index={tech.label.index} title={tech.label.title} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] text-ink sm:text-5xl">
                {tech.heading}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
            {tech.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph} delay={0.08 + index * 0.05}>
                <p className="font-tc text-[0.9375rem] leading-[2] text-ink/70">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <ul className="mt-16 border-t border-ink/12 lg:mt-24">
          {tech.cards.map((card, index) => (
            <Reveal
              as="li"
              key={card.id}
              delay={0.05 * index}
              y={12}
              duration={0.6}
              className="border-b border-ink/12"
            >
              <div className="group grid grid-cols-1 gap-4 py-9 md:grid-cols-12 md:gap-8 lg:py-12">
                <div className="md:col-span-1">
                  <span className="label-text text-coffee/70">{card.id}</span>
                </div>

                <div className="md:col-span-5">
                  <h3 className="font-serif text-2xl leading-snug text-ink transition-colors duration-400 ease-editorial group-hover:text-coffee sm:text-3xl lg:text-[2.25rem]">
                    {card.title}
                  </h3>
                  <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-label text-sage">
                    {card.stack}
                  </p>
                </div>

                <div className="md:col-span-5 md:col-start-8 md:self-center">
                  <p className="font-tc text-[0.9375rem] leading-[2] text-ink/65">
                    {card.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
