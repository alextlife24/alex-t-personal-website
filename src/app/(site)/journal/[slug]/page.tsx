import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlockRenderer from '@/components/journal/BlockRenderer';
import Reveal from '@/components/ui/Reveal';
import SmartImage from '@/components/ui/SmartImage';
import { getPostBySlug } from '@/lib/journal';
import { formatDate } from '@/lib/types/journal';

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Not found', robots: { index: false, follow: false } };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt ?? undefined,
      ...(post.cover.url ? { images: [{ url: post.cover.url }] } : {}),
    },
  };
}

export default async function JournalPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // 草稿或不存在的 slug 都會走到這裡（RLS 讓匿名讀不到 draft）
  if (!post) notFound();

  return (
    <article className="pb-24 pt-32 sm:pt-36 lg:pb-32 lg:pt-40">
      {/* 標題區 */}
      <header className="shell">
        <Reveal>
          <div className="flex flex-wrap items-center gap-4">
            <span className="label-text text-coffee">{post.category}</span>
            <span aria-hidden className="h-px w-8 bg-ink/20" />
            <time dateTime={post.publishedAt ?? undefined} className="label-text text-ink/40">
              {formatDate(post.publishedAt)}
            </time>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="mt-7 max-w-4xl font-serif text-[2.5rem] leading-[1.08] tracking-[-0.01em] text-ink sm:text-6xl">
            {post.title}
          </h1>
        </Reveal>

        {post.excerpt && (
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-prose2 font-tc text-[1.0625rem] leading-[2] text-ink/65">
              {post.excerpt}
            </p>
          </Reveal>
        )}

        {post.tags.length > 0 && (
          <Reveal delay={0.14}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {post.tags.map((tag) => (
                <li key={tag} className="label-text text-ink/35">
                  {tag}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </header>

      {/* 封面 */}
      {post.cover.url && (
        <Reveal delay={0.1} duration={0.9} y={24}>
          <figure className="shell mt-14 lg:mt-16">
            <SmartImage
              image={{
                url: post.cover.url,
                alt: post.cover.alt,
                width: post.cover.width,
                height: post.cover.height,
                focalX: post.cover.focalX,
                focalY: post.cover.focalY,
              }}
              ratio="original"
              fallbackRatio="landscape"
              sizes="100vw"
              priority
            />
          </figure>
        </Reveal>
      )}

      {/* 內文區塊 */}
      <div className="shell mt-16 lg:mt-20">
        {post.blocks.length === 0 ? (
          <p className="mx-auto max-w-[42rem] font-sans text-sm text-ink/40">
            這篇文章還沒有內容。
          </p>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {post.blocks.map((block, index) => (
              <Reveal key={block.id} delay={Math.min(index, 6) * 0.03} y={12} duration={0.6}>
                <BlockRenderer block={block} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* 頁尾導覽 */}
      <div className="shell mt-24 border-t border-ink/10 pt-10">
        <Link
          href="/journal"
          className="group inline-flex items-center gap-2 font-sans text-sm text-ink/60 transition-colors duration-400 ease-editorial hover:text-coffee"
        >
          <span
            aria-hidden
            className="transition-transform duration-400 group-hover:-translate-x-1"
          >
            ←
          </span>
          All stories
        </Link>
      </div>
    </article>
  );
}
