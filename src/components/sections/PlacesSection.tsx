import Figure from '@/components/ui/Figure';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { places } from '@/data/places';
import { cn } from '@/lib/utils';

/**
 * 03 / PLACES。
 * 四個 Journal Card，用交錯的上下位移做出雜誌感，不對稱。
 * 目前只做視覺卡片，Hover 顯示 View Story，但標示 Coming Soon。
 */
export default function PlacesSection() {
  return (
    <section id="places" className="section-space">
      <div className="shell">
        <Reveal>
          <SectionLabel index={places.label.index} title={places.label.title} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal delay={0.05}>
              <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] text-ink sm:text-5xl">
                {places.heading}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <div className="space-y-4">
              {places.paragraphs.map((paragraph, index) => (
                <Reveal key={paragraph} delay={0.08 + index * 0.05}>
                  <p className="font-tc text-[0.9375rem] leading-[2] text-ink/70">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:gap-x-16 lg:gap-y-20">
          {places.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.id}
              delay={0.04 * index}
              className={cn('group', index % 2 === 1 && 'sm:mt-16 lg:mt-24')}
            >
              <div className="relative">
                <Figure
                  src={item.image}
                  alt={item.imageAlt}
                  ratio={index % 2 === 0 ? 'aspect-[4/5]' : 'aspect-[3/4]'}
                  sizes="(max-width: 640px) 100vw, 46vw"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink/45 to-transparent p-5 opacity-0 transition-opacity duration-600 ease-editorial group-hover:opacity-100">
                  <span className="label-text text-paper/90">View Story &#8599;</span>
                  {item.comingSoon && (
                    <span className="border border-paper/40 px-2 py-1 text-[0.625rem] uppercase tracking-label text-paper/80">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-4">
                <span className="label-text text-coffee">{item.id}</span>
                <span className="label-text text-ink/40">{item.meta}</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-snug text-ink transition-colors duration-400 ease-editorial group-hover:text-coffee sm:text-[1.75rem]">
                {item.title}
              </h3>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
