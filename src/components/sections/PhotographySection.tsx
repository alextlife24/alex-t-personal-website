import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import SmartImage from '@/components/ui/SmartImage';
import type { PhotographyContent } from '@/lib/types/content';

/**
 * 04 / PHOTOGRAPHY
 *
 * 視覺節奏：不規則 masonry。
 * 用 CSS columns 讓每張照片保留自己的比例，橫式、直式、方形混排都不會變形。
 * 手機為兩欄，桌機三欄，全部保持大量留白。
 */
export default function PhotographySection({
  photography,
}: {
  photography: PhotographyContent;
}) {
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

        {/* Masonry：保留每張照片的原始比例 */}
        <Reveal delay={0.05} y={20}>
          <div className="mt-16 columns-2 gap-4 sm:gap-5 lg:mt-24 lg:columns-3 lg:gap-6 [&>figure]:mb-4 sm:[&>figure]:mb-5 lg:[&>figure]:mb-6">
            {photography.photos.map((photo) => (
              <figure key={photo.id} className="group break-inside-avoid">
                <SmartImage
                  image={{
                    url: photo.image,
                    alt: photo.alt,
                    width: photo.width,
                    height: photo.height,
                    focalX: photo.focalX,
                    focalY: photo.focalY,
                  }}
                  ratio="original"
                  fallbackRatio={photo.fallbackRatio ?? 'portrait'}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  zoomOnHover
                >
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/40 to-transparent p-4 opacity-0 transition-opacity duration-600 ease-editorial group-hover:opacity-100">
                    <span className="label-text text-paper/90">{photo.place}</span>
                    <span className="label-text text-paper/70">{photo.year}</span>
                  </div>
                </SmartImage>
              </figure>
            ))}
          </div>
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
