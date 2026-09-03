import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import SmartImage from '@/components/ui/SmartImage';
import type { PlacesContent } from '@/lib/types/content';
import { cn } from '@/lib/utils';

/**
 * 03 / PLACES
 *
 * 視覺節奏：大型 cinematic 照片配上大字故事標題。
 * 第一則佔滿寬度、後續交替左右，刻意不做等大卡片牆。
 */
export default function PlacesSection({ places }: { places: PlacesContent }) {
  const [lead, ...rest] = places.items;

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
      </div>

      {/* 首則：滿版 cinematic */}
      {lead && (
        <Reveal delay={0.05} y={24} duration={0.9}>
          <figure className="group mt-16 lg:mt-24">
            <div className="shell">
              <SmartImage
                image={{
                  url: lead.image,
                  alt: lead.imageAlt,
                  width: lead.width,
                  height: lead.height,
                  focalX: lead.focalX,
                  focalY: lead.focalY,
                }}
                ratio="panorama"
                sizes="100vw"
                zoomOnHover
              >
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent p-6 sm:p-10">
                  <span className="label-text text-paper/70">{lead.meta}</span>
                  <p className="mt-3 max-w-2xl font-serif text-2xl leading-tight text-paper sm:text-4xl">
                    {lead.title}
                  </p>
                </div>
              </SmartImage>
            </div>
          </figure>
        </Reveal>
      )}

      {/* 其餘：左右交替的大版位 */}
      <div className="shell mt-16 space-y-16 lg:mt-24 lg:space-y-24">
        {rest.map((item, index) => {
          const flipped = index % 2 === 1;
          return (
            <Reveal key={item.id} delay={0.04} y={20}>
              <article
                className={cn(
                  'group grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center md:gap-10',
                )}
              >
                <div
                  className={cn(
                    'md:col-span-7',
                    flipped && 'md:order-2 md:col-start-6',
                  )}
                >
                  <SmartImage
                    image={{
                      url: item.image,
                      alt: item.imageAlt,
                      width: item.width,
                      height: item.height,
                      focalX: item.focalX,
                      focalY: item.focalY,
                    }}
                    ratio={index % 3 === 0 ? 'landscape' : 'tall'}
                    sizes="(max-width: 768px) 100vw, 58vw"
                    zoomOnHover
                  />
                </div>

                <div
                  className={cn('md:col-span-4', flipped ? 'md:order-1' : 'md:col-start-9')}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="label-text text-coffee">{item.id}</span>
                    <span className="label-text text-ink/40">{item.meta}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl leading-snug text-ink transition-colors duration-400 ease-editorial group-hover:text-coffee sm:text-3xl">
                    {item.title}
                  </h3>
                  {item.comingSoon && (
                    <span className="mt-5 inline-block border border-ink/15 px-2.5 py-1 text-[0.625rem] uppercase tracking-label text-ink/40">
                      Coming Soon
                    </span>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
