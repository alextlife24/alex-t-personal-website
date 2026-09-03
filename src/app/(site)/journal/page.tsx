import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import SmartImage from '@/components/ui/SmartImage';
import { getPublishedPosts } from '@/lib/journal';
import { formatDate } from '@/lib/types/journal';
import { getSiteSettings } from '@/lib/content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: 'Journal',
    description: `${site.name} 的文章：咖啡、花蓮、攝影與科技探索。`,
    alternates: { canonical: '/journal' },
  };
}

export default async function JournalIndexPage() {
  const posts = await getPublishedPosts();
  const [lead, ...rest] = posts;

  return (
    <div className="section-space pt-32 sm:pt-36 lg:pt-40">
      <div className="shell">
        <Reveal>
          <SectionLabel index="—" title="JOURNAL" />
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-10 max-w-3xl font-serif text-4xl leading-[1.1] tracking-[-0.01em] text-ink sm:text-6xl">
            Stories, slowly collected.
          </h1>
        </Reveal>

        {posts.length === 0 ? (
          <Reveal delay={0.1}>
            <p className="mt-16 border border-dashed border-ink/15 p-10 text-center font-sans text-sm text-ink/40">
              目前還沒有已發佈的文章。
            </p>
          </Reveal>
        ) : (
          <>
            {/* 首篇：大型 editorial 版位 */}
            <Reveal delay={0.1} y={24} duration={0.9}>
              <Link
                href={`/journal/${lead.slug}`}
                className="group mt-16 grid grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-12"
              >
                <div className="lg:col-span-7">
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
                    priority
                    zoomOnHover
                  />
                </div>

                <div className="lg:col-span-5 lg:self-center">
                  <div className="flex items-center gap-4">
                    <span className="label-text text-coffee">{lead.category}</span>
                    <span aria-hidden className="h-px w-6 bg-ink/20" />
                    <time className="label-text text-ink/40">
                      {formatDate(lead.publishedAt)}
                    </time>
                  </div>

                  <h2 className="mt-5 font-serif text-3xl leading-tight text-ink transition-colors duration-400 ease-editorial group-hover:text-coffee sm:text-[2.5rem]">
                    {lead.title}
                  </h2>

                  {lead.excerpt && (
                    <p className="mt-5 max-w-prose2 font-tc text-[0.9375rem] leading-[2] text-ink/65">
                      {lead.excerpt}
                    </p>
                  )}

                  <span className="mt-7 inline-flex items-center gap-2 border-b border-ink/25 pb-1 font-sans text-sm text-ink transition-colors duration-400 group-hover:border-coffee group-hover:text-coffee">
                    Read story
                    <span
                      aria-hidden
                      className="transition-transform duration-400 ease-editorial group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>

            {/* 其餘文章 */}
            {rest.length > 0 && (
              <ul className="mt-20 grid grid-cols-1 gap-x-10 gap-y-14 border-t border-ink/10 pt-14 sm:grid-cols-2 lg:mt-28 lg:grid-cols-3 lg:gap-x-12">
                {rest.map((post, index) => (
                  <Reveal as="li" key={post.id} delay={0.04 * index}>
                    <Link href={`/journal/${post.slug}`} className="group block">
                      <SmartImage
                        image={{
                          url: post.cover.url,
                          alt: post.cover.alt,
                          width: post.cover.width,
                          height: post.cover.height,
                          focalX: post.cover.focalX,
                          focalY: post.cover.focalY,
                        }}
                        ratio={index % 3 === 1 ? 'portrait' : 'landscape'}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 46vw, 30vw"
                        zoomOnHover
                      />

                      <div className="mt-5 flex items-center gap-3">
                        <span className="label-text text-coffee">{post.category}</span>
                        <span aria-hidden className="h-px w-4 bg-ink/20" />
                        <time className="label-text text-ink/35">
                          {formatDate(post.publishedAt)}
                        </time>
                      </div>

                      <h3 className="mt-3 font-serif text-xl leading-snug text-ink transition-colors duration-400 group-hover:text-coffee sm:text-2xl">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="mt-2 line-clamp-3 font-tc text-sm leading-[1.9] text-ink/55">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  </Reveal>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
