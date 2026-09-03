import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import SmartImage from '@/components/ui/SmartImage';
import type { CoffeeContent } from '@/lib/types/content';

/**
 * 02 / COFFEE
 *
 * 視覺節奏：不對稱 editorial grid。
 * 三張卡片刻意不等大、不等高、不對齊 —— 大直式、小方形偏下、橫向通欄，
 * 與後面 Places 的滿版照片、Tech 的純文字清單各自不同。
 */
export default function CoffeeSection({ coffee }: { coffee: CoffeeContent }) {
  const [first, second, third] = coffee.cards;

  return (
    <section id="coffee" className="section-space bg-sand">
      <div className="shell">
        <Reveal>
          <SectionLabel index={coffee.label.index} title={coffee.label.title} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] text-ink sm:text-5xl">
                {coffee.heading}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <Reveal delay={0.1}>
              <p className="font-sans text-sm leading-relaxed text-ink/55">
                {coffee.lede}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Card 01：大直式，靠左 */}
        {first && (
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10 lg:mt-24">
            <Reveal as="article" delay={0.05} className="group md:col-span-6">
              <SmartImage
                image={{
                  url: first.image,
                  alt: first.imageAlt,
                  width: first.width,
                  height: first.height,
                  focalX: first.focalX,
                  focalY: first.focalY,
                }}
                ratio="portrait"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="bg-paper"
                zoomOnHover
              />
              <div className="mt-7 flex items-baseline gap-4">
                <span className="label-text text-coffee">{first.id}</span>
                <span className="label-text text-ink/45">{first.kicker}</span>
              </div>
              <h3 className="mt-4 font-serif text-3xl leading-snug text-ink sm:text-[2.125rem]">
                {first.title}
              </h3>
              <p className="mt-4 max-w-prose2 font-tc text-[0.9375rem] leading-[2] text-ink/70">
                {first.body}
              </p>
              {first.items && (
                <div className="mt-8 border-t border-ink/10 pt-6">
                  <p className="label-text text-ink/35">{first.itemsLabel}</p>
                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {first.items.map((item) => (
                      <li key={item} className="font-sans text-sm text-ink/65">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Reveal>

            {/* Card 02：較小、往下偏移，形成不對稱 */}
            {second && (
              <Reveal
                as="article"
                delay={0.12}
                className="group md:col-span-5 md:col-start-8 md:pt-28 lg:pt-40"
              >
                <SmartImage
                  image={{
                    url: second.image,
                    alt: second.imageAlt,
                    width: second.width,
                    height: second.height,
                    focalX: second.focalX,
                    focalY: second.focalY,
                  }}
                  ratio="square"
                  sizes="(max-width: 768px) 100vw, 38vw"
                  className="bg-paper"
                  zoomOnHover
                />
                <div className="mt-7 flex items-baseline gap-4">
                  <span className="label-text text-coffee">{second.id}</span>
                  <span className="label-text text-ink/45">{second.kicker}</span>
                </div>
                <h3 className="mt-4 font-serif text-3xl leading-snug text-ink">
                  {second.title}
                </h3>
                <p className="mt-4 font-tc text-[0.9375rem] leading-[2] text-ink/70">
                  {second.body}
                </p>
                {second.items && (
                  <div className="mt-8 border-t border-ink/10 pt-6">
                    <p className="label-text text-ink/35">{second.itemsLabel}</p>
                    <ul className="mt-4 space-y-1.5">
                      {second.items.map((item) => (
                        <li key={item} className="font-serif text-lg text-sage">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Reveal>
            )}
          </div>
        )}

        {/* Card 03：橫向通欄，純文字收尾 */}
        {third && (
          <Reveal as="article" delay={0.05} className="mt-20 lg:mt-28">
            <div className="grid grid-cols-1 items-center gap-8 border-t border-ink/10 pt-12 md:grid-cols-12 md:gap-12">
              <div className="md:col-span-5">
                <div className="flex items-baseline gap-4">
                  <span className="label-text text-coffee">{third.id}</span>
                  <span className="label-text text-ink/45">{third.kicker}</span>
                </div>
                <h3 className="mt-4 font-serif text-3xl leading-snug text-ink sm:text-4xl">
                  {third.title}
                </h3>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <p className="max-w-prose2 font-tc text-[0.9375rem] leading-[2] text-ink/70">
                  {third.body}
                </p>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
