'use client';

import type { DraftBlock } from '@/components/admin/journal/BlockEditor';
import type { DraftGallery } from '@/components/admin/journal/GalleryEditor';
import type { getBrowserClient } from '@/lib/supabase/client';
import type {
  ContentBlockRow,
  GalleryImageRow,
  GalleryRow,
  JournalPostRow,
} from '@/lib/types/database';

type Client = NonNullable<ReturnType<typeof getBrowserClient>>;

export type PostMeta = {
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  cover_alt: string;
  cover_width: number | null;
  cover_height: number | null;
  cover_focal_x: number;
  cover_focal_y: number;
  category: JournalPostRow['category'];
  tags: string[];
  published_at: string | null;
  status: JournalPostRow['status'];
  featured: boolean;
};

/** 讀取單篇文章（含區塊與 gallery）供後台編輯 */
export async function loadPost(
  supabase: Client,
  postId: string,
): Promise<{ meta: PostMeta; blocks: DraftBlock[] } | null> {
  const { data: post, error } = await supabase
    .from('journal_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle();

  if (error || !post) return null;

  const { data: blockRows } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('post_id', postId)
    .order('sort_order', { ascending: true });

  const blocks: ContentBlockRow[] = blockRows ?? [];

  const galleryIds = blocks
    .filter((block) => block.type === 'gallery')
    .map((block) => (block.content as { galleryId?: string }).galleryId)
    .filter((id): id is string => Boolean(id));

  let galleries: GalleryRow[] = [];
  let images: GalleryImageRow[] = [];

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
    images = gi ?? [];
  }

  return {
    meta: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      cover_image_url: post.cover_image_url,
      cover_alt: post.cover_alt ?? '',
      cover_width: post.cover_width,
      cover_height: post.cover_height,
      cover_focal_x: Number(post.cover_focal_x ?? 0.5),
      cover_focal_y: Number(post.cover_focal_y ?? 0.5),
      category: post.category,
      tags: post.tags ?? [],
      published_at: post.published_at,
      status: post.status,
      featured: post.featured,
    },
    blocks: blocks.map((block): DraftBlock => {
      const galleryId = (block.content as { galleryId?: string }).galleryId;
      const galleryRow = galleryId
        ? galleries.find((item) => item.id === galleryId)
        : undefined;

      return {
        id: block.id,
        type: block.type,
        content: block.content ?? {},
        settings: block.settings ?? {},
        ...(block.type === 'gallery'
          ? {
              gallery: {
                id: galleryRow?.id ?? null,
                title: galleryRow?.title ?? '',
                style: galleryRow?.style ?? 'editorial',
                images: images
                  .filter((image) => image.gallery_id === galleryRow?.id)
                  .map((image) => ({
                    id: image.id,
                    mediaId: image.media_id,
                    url: image.image_url,
                    alt: image.alt ?? '',
                    caption: image.caption ?? '',
                    width: image.width,
                    height: image.height,
                    focalX: Number(image.focal_x ?? 0.5),
                    focalY: Number(image.focal_y ?? 0.5),
                    isCover: image.is_cover,
                  })),
              } satisfies DraftGallery,
            }
          : {}),
      };
    }),
  };
}

/**
 * 儲存整篇文章。
 *
 * 區塊採「整批重建」策略：先刪掉這篇文章既有的 blocks 與 galleries，
 * 再依目前草稿順序重新寫入。文章規模不大（數十個區塊），
 * 這樣比逐一 diff 簡單得多，也不會出現排序錯亂。
 * gallery_images 由 galleries 的 on delete cascade 一併清除。
 */
export async function savePost(
  supabase: Client,
  postId: string,
  meta: PostMeta,
  blocks: DraftBlock[],
): Promise<string | null> {
  const { error: metaError } = await supabase
    .from('journal_posts')
    .update({
      title: meta.title.trim() || 'Untitled',
      slug: meta.slug.trim(),
      excerpt: meta.excerpt.trim() || null,
      cover_image_url: meta.cover_image_url,
      cover_alt: meta.cover_alt.trim() || null,
      cover_width: meta.cover_width,
      cover_height: meta.cover_height,
      cover_focal_x: meta.cover_focal_x,
      cover_focal_y: meta.cover_focal_y,
      category: meta.category,
      tags: meta.tags,
      published_at:
        meta.status === 'published'
          ? (meta.published_at ?? new Date().toISOString())
          : meta.published_at,
      status: meta.status,
      featured: meta.featured,
    })
    .eq('id', postId);

  if (metaError) return metaError.message;

  // 清掉舊的區塊與 gallery（gallery_images 會跟著 cascade）
  const { error: delBlocks } = await supabase
    .from('content_blocks')
    .delete()
    .eq('post_id', postId);
  if (delBlocks) return delBlocks.message;

  const { error: delGalleries } = await supabase
    .from('galleries')
    .delete()
    .eq('post_id', postId);
  if (delGalleries) return delGalleries.message;

  // 依序重建
  for (const [index, block] of blocks.entries()) {
    let content = { ...block.content };

    if (block.type === 'gallery' && block.gallery) {
      const { data: gallery, error: galleryError } = await supabase
        .from('galleries')
        .insert({
          post_id: postId,
          title: block.gallery.title.trim() || null,
          style: block.gallery.style,
        })
        .select()
        .single();

      if (galleryError || !gallery) {
        return galleryError?.message ?? '建立 gallery 失敗';
      }

      if (block.gallery.images.length > 0) {
        const { error: imagesError } = await supabase.from('gallery_images').insert(
          block.gallery.images.map((image, imageIndex) => ({
            gallery_id: gallery.id,
            media_id: image.mediaId,
            image_url: image.url,
            alt: image.alt.trim() || null,
            caption: image.caption.trim() || null,
            width: image.width,
            height: image.height,
            focal_x: image.focalX,
            focal_y: image.focalY,
            is_cover: image.isCover,
            sort_order: imageIndex,
          })) as never,
        );
        if (imagesError) return imagesError.message;
      }

      content = { ...content, galleryId: gallery.id };
    }

    const { error: blockError } = await supabase.from('content_blocks').insert({
      post_id: postId,
      type: block.type,
      content,
      settings: block.settings,
      sort_order: index,
    });

    if (blockError) return blockError.message;
  }

  return null;
}
