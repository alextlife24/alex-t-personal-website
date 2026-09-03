import { getServerClient } from '@/lib/supabase/server';
import type {
  ContentBlockRow,
  GalleryImageRow,
  GalleryRow,
  JournalPostRow,
} from '@/lib/types/database';
import type { Block, Gallery, JournalPost, JournalSummary } from '@/lib/types/journal';

/**
 * Journal 的前台資料存取層。
 *
 * 所有查詢都是以匿名身分執行，RLS 保證只會拿到 status = 'published' 的文章。
 * 未設定 Supabase 時一律回傳空陣列，前台會顯示「尚無文章」而不是壞掉。
 */

function toSummary(row: JournalPostRow): JournalSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    cover: {
      url: row.cover_image_url,
      alt: row.cover_alt ?? row.title,
      width: row.cover_width,
      height: row.cover_height,
      focalX: Number(row.cover_focal_x ?? 0.5),
      focalY: Number(row.cover_focal_y ?? 0.5),
    },
    category: row.category,
    tags: row.tags ?? [],
    publishedAt: row.published_at,
    status: row.status,
    featured: row.featured,
  };
}

function toGallery(row: GalleryRow, images: GalleryImageRow[]): Gallery {
  return {
    id: row.id,
    title: row.title,
    style: row.style,
    images: images
      .filter((image) => image.gallery_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        id: image.id,
        url: image.image_url,
        alt: image.alt,
        caption: image.caption,
        width: image.width,
        height: image.height,
        focalX: Number(image.focal_x ?? 0.5),
        focalY: Number(image.focal_y ?? 0.5),
        isCover: image.is_cover,
      })),
  };
}

/** 已發佈文章列表 */
export async function getPublishedPosts(limit?: number): Promise<JournalSummary[]> {
  const supabase = await getServerClient();
  if (!supabase) return [];

  let query = supabase
    .from('journal_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map(toSummary);
}

/** 首頁 LATEST STORIES：優先 featured，其餘依時間排序 */
export async function getLatestStories(limit = 4): Promise<JournalSummary[]> {
  const posts = await getPublishedPosts(limit + 4);
  const featured = posts.filter((post) => post.featured);
  const rest = posts.filter((post) => !post.featured);
  return [...featured, ...rest].slice(0, limit);
}

/** 單篇文章（含所有區塊與 gallery） */
export async function getPostBySlug(slug: string): Promise<JournalPost | null> {
  const supabase = await getServerClient();
  if (!supabase) return null;

  const { data: post, error } = await supabase
    .from('journal_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !post) return null;

  const { data: blockRows } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('post_id', post.id)
    .order('sort_order', { ascending: true });

  const blocks: ContentBlockRow[] = blockRows ?? [];

  // 一次把這篇文章用到的 gallery 全部取回，避免 N+1 查詢
  const galleryIds = blocks
    .filter((block) => block.type === 'gallery')
    .map((block) => (block.content as { galleryId?: string }).galleryId)
    .filter((id): id is string => Boolean(id));

  let galleries: GalleryRow[] = [];
  let galleryImages: GalleryImageRow[] = [];

  if (galleryIds.length > 0) {
    const [{ data: g }, { data: gi }] = await Promise.all([
      supabase.from('galleries').select('*').in('id', galleryIds),
      supabase
        .from('gallery_images')
        .select('*')
        .in('gallery_id', galleryIds)
        .order('sort_order', { ascending: true }),
    ]);
    galleries = g ?? [];
    galleryImages = gi ?? [];
  }

  return {
    ...toSummary(post),
    blocks: blocks.map((block): Block => {
      const galleryId = (block.content as { galleryId?: string }).galleryId;
      const galleryRow = galleryId
        ? galleries.find((item) => item.id === galleryId)
        : undefined;

      return {
        id: block.id,
        type: block.type,
        content: block.content ?? {},
        settings: block.settings ?? {},
        sortOrder: block.sort_order,
        gallery: galleryRow ? toGallery(galleryRow, galleryImages) : null,
      };
    }),
  };
}

/** 產生 sitemap 用的所有已發佈 slug */
export async function getPublishedSlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const supabase = await getServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('journal_posts')
    .select('slug, updated_at')
    .eq('status', 'published');

  return (data ?? []).map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
}
