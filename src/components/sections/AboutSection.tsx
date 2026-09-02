import SectionLabel from '@/components/ui/SectionLabel';
import Reveal from '@/components/ui/Reveal';
import type { AboutContent } from '@/lib/types/content';

/** 01 / ABOUT。純文字區塊，不做技能百分比或 Progress Bar。 */
export default function AboutSection({ about }: { about: AboutContent }) {
  return (
    <section id="about" className="section-space">
      <div className="shell">
        <Reveal>
          <SectionLabel index={about.label.index} title={about.label.title} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal delay={0.05}>
              <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] text-ink sm:text-5xl">
                {about.heading}
              </h2>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="space-y-6">
              {about.paragraphs.map((paragraph, index) => (
                <Reveal key={paragraph} delay={0.05 + index * 0.04}>
                  <p className="font-tc text-[0.9375rem] leading-[2.05] text-ink/75">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-ink/10 pt-7">
                {about.interests.map((interest) => (
                  <li key={interest} className="label-text text-ink/45">
                    {interest}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
