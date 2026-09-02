import Figure from '@/components/ui/Figure';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { photography } from '@/data/photography';

/**
 * 04 / PHOTOGRAPHY。
 * 刻意不做 Instagram 九宮格：
 * 一張大型直圖 + 兩張小圖 + 一張橫圖，並保留大量留白。
 */
export default function PhotographySection() {
  const [large, smallA, smallB, wide] = photography.photos;

  return (
    <section id="photography" className="section-space bg-sand">
      <div className="shell">
        <Reveal>
          <SectionLabel
            index={photography.label.index}
            title={photography.label.title}
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal delay={0.05}>
              <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] text-ink sm:text-5xl">
                {photography.headingLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <div className="space-y-4">
              {photography.paragraphs.map((paragraph, index) => (
                <Reveal key={paragraph} delay={0.08 + index * 0.05}>
                  <p className="font-tc text-[0.9375rem] leading-[2] text-ink/70">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.16}>
              <dl className="mt-9 border-t border-ink/10 pt-6">
                <dt className="label-text text-ink/35">CAMERA</dt>
                <dd className="mt-2 font-serif text-xl text-coffee">
                  {photography.camera}
                </dd>
              </dl>
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 lg:mt-24">
          <Reveal as="figure" delay={0.05} className="group md:col-span-7">
            <PhotoFrame
              src={large.image}
              alt={large.alt}
              place={large.place}
              year={large.year}
              ratio="aspect-[4/5]"
              sizes="(max-width: 768px) 100vw, 56vw"
            />
          </Reveal>

          <div className="flex flex-col gap-10 md:col-span-4 md:col-start-9 md:justify-end md:gap-8">
            <Reveal as="figure" delay={0.1} className="group">
              <PhotoFrame
                src={smallA.image}
                alt={smallA.alt}
                place={smallA.place}
                year={smallA.year}
                ratio="aspect-square"
                sizes="(max-width: 768px) 100vw, 32vw"
              />
            </Reveal>
            <Reveal as="figure" delay={0.16} className="group">
              <PhotoFrame
                src={smallB.image}
                alt={smallB.alt}
                place={smallB.place}
                year={smallB.year}
                ratio="aspect-[3/4]"
                sizes="(max-width: 768px) 100vw, 32vw"
              />
            </Reveal>
          </div>
        </div>

        <Reveal as="figure" delay={0.05} className="group mt-20 lg:mt-32">
          <PhotoFrame
            src={wide.image}
            alt={wide.alt}
            place={wide.place}
            year={wide.year}
            ratio="aspect-[3/2] lg:aspect-[16/7]"
            sizes="100vw"
          />
        </Reveal>

        <Reveal delay={0.05}>
          <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-ink/10 pt-6">
            {photography.meta.map((entry) => (
              <li key={entry} className="label-text text-ink/40">
                {entry}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** 單張照片：Hover 時淡入地點與年份。 */
function PhotoFrame({
  src,
  alt,
  place,
  year,
  ratio,
  sizes,
}: {
  src: string | null;
  alt: string;
  place: string;
  year: string;
  ratio: string;
  sizes: string;
}) {
  return (
    <Figure src={src} alt={alt} ratio={ratio} sizes={sizes} className="bg-paper">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/40 to-transparent p-5 opacity-0 transition-opacity duration-600 ease-editorial group-hover:opacity-100">
        <span className="label-text text-paper/90">{place}</span>
        <span className="label-text text-paper/70">{year}</span>
      </div>
    </Figure>
  );
}
