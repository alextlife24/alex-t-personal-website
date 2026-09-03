import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import SmartImage from '@/components/ui/SmartImage';
import { formatDate, type JournalSummary } from '@/lib/types/journal';

/**
 * 首頁 LATEST STORIES。
 *
 * 視覺節奏：第一篇大型 featured story + 右側較小的 editorial 清單，
 * 刻意與其他 section 的「並排三張卡」不同。
 */
export default function JournalSection({ posts }: { posts: JournalSummary[] }) {
  if (posts.length === 0) return null;

  const [lead, ...rest] = posts;

  return (
    <section id="journal" className="section-space">
      <div className="shell">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionLabel index="—" title="LATEST STORIES" />
            <Link
              href="/journal"
              className="group inline-flex items-center gap-2 font-sans text-sm text-ink/60 transition-colors duration-400 ease-editorial hover:text-coffee"
            >
              View Journal
              <span
                aria-hidden
                className="transition-transform duration-400 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
          {/* Featured */}
          <Reveal delay={0.05} y={20} duration={0.85} className="lg:col-span-7">
            <Link href={`/journal/${lead.slug}`} className="group block">
              <SmartImage
                image={{
                  url: lead.cover.url,
                  alt: lead.cover.alt,
                  width: lead.cover.width,
                  height: lead.cover.height,
                  focalX: lead.cover.focalX,
                  focalY: lead.cover.focalY,
                }}
                ratio="landscape"
                sizes="(max-width: 1024px) 100vw, 58vw"
                zoomOnHover
              />

              <div className="mt-6 flex items-center gap-4">
                <span className="label-text text-coffee">{lead.category}</span>
                <span aria-hidden className="h-px w-6 bg-ink/20" />
                <time className="label-text text-ink/40">
                  {formatDate(lead.publishedAt)}
                </time>
              </div>

              <h3 className="mt-4 font-serif text-3xl leading-tight text-ink transition-colors duration-400 ease-editorial group-hover:text-coffee sm:text-4xl">
                {lead.title}
              </h3>

              {lead.excerpt && (
                <p className="mt-4 max-w-prose2 font-tc text-[0.9375rem] leading-[2] text-ink/65">
                  {lead.excerpt}
                </p>
              )}
            </Link>
          </Reveal>

          {/* 其餘 */}
          {rest.length > 0 && (
            <div className="lg:col-span-4 lg:col-start-9">
              <ul className="border-t border-ink/10">
                {rest.map((post, index) => (
                  <Reveal
                    as="li"
                    key={post.id}
                    delay={0.06 + index * 0.05}
                    y={12}
                    duration={0.6}
                    className="border-b border-ink/10"
                  >
                    <Link
                      href={`/journal/${post.slug}`}
                      className="group flex gap-4 py-5"
                    >
                      <span className="w-20 shrink-0 sm:w-24">
                        <SmartImage
                          image={{
                            url: post.cover.url,
                            alt: post.cover.alt,
                            width: post.cover.width,
                            height: post.cover.height,
                            focalX: post.cover.focalX,
                            focalY: post.cover.focalY,
                          }}
                          ratio="square"
                          sizes="96px"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="label-text text-coffee/70">
                            {post.category}
                          </span>
                        </span>
                        <span className="mt-1.5 block font-serif text-lg leading-snug text-ink transition-colors duration-400 group-hover:text-coffee">
                          {post.title}
                        </span>
                        <time className="mt-1 block font-sans text-xs text-ink/35">
                          {formatDate(post.publishedAt)}
                        </time>
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
