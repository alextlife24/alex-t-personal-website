import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import SocialLink from '@/components/ui/SocialLink';
import { contact, socials } from '@/data/social';

/**
 * 07 / CONNECT。頁面最底的聯絡區塊，Header 的 Say Hello 會捲動到這裡。
 * 社群清單只維護在 src/data/social.ts。
 */
export default function ContactSection() {
  return (
    <section id="connect" className="section-space">
      <div className="shell">
        <Reveal>
          <SectionLabel index={contact.label.index} title={contact.label.title} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal delay={0.05}>
              <h2 className="font-serif text-4xl leading-[1.15] tracking-[-0.01em] text-ink sm:text-5xl lg:text-[3.5rem]">
                {contact.heading}
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-10 font-sans text-[0.9375rem] leading-[2] text-ink/60">
                {contact.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal delay={0.08}>
              <p className="label-text border-b border-ink/15 pb-4 text-ink/35">
                ELSEWHERE
              </p>
            </Reveal>
            <ul>
              {socials.map((item, index) => (
                <Reveal as="li" key={item.name} delay={0.04 * index} y={10} duration={0.5}>
                  <SocialLink item={item} />
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
