import { getServerClient } from '@/lib/supabase/server';
import { about as aboutFallback } from '@/data/about';
import { coffee as coffeeFallback } from '@/data/coffee';
import { hero as heroFallback } from '@/data/hero';
import { photography as photographyFallback } from '@/data/photography';
import { places as placesFallback } from '@/data/places';
import { projects as projectsFallback } from '@/data/projects';
import { site as siteFallback } from '@/data/site';
import { socials as socialsFallback, contact as contactFallback } from '@/data/social';
import { tech as techFallback } from '@/data/tech';
import type { SocialPlatform } from '@/lib/types/database';
import type {
  AboutContent,
  CoffeeContent,
  ContactContent,
  HeroContent,
  PhotographyContent,
  PlacesContent,
  ProjectsContent,
  SiteContent,
  SocialIconName,
  SocialItem,
  TechContent,
} from '@/lib/types/content';

/**
 * 前台內容載入層。
 *
 * 規則（第一階段的漸進式轉移）：
 *   Supabase 有資料 → 使用 Supabase
 *   Supabase 沒資料、未設定、或查詢失敗 → 使用 src/data 的原始內容
 *
 * 因此即使資料庫尚未建立或設定錯誤，前台仍然可以完整顯示。
 */

const splitLines = (value: string | null | undefined): string[] =>
  (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const yearOf = (date: string | null): string =>
  date ? String(new Date(date).getFullYear()) : '2026';

const padIndex = (index: number): string => String(index + 1).padStart(2, '0');

// ------------------------------------------------------------
// Site settings
// ------------------------------------------------------------
export async function getSiteSettings(): Promise<SiteContent> {
  const supabase = await getServerClient();
  if (!supabase) return siteFallback;

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return siteFallback;

  return {
    ...siteFallback,
    name: data.site_name || siteFallback.name,
    // tagline 是 Footer 的品牌標語，維持靜態，不隨 site_title 改變
    titleSuffix: data.site_title || siteFallback.titleSuffix,
    title: `${data.site_name || siteFallback.name} — ${data.site_title || siteFallback.titleSuffix}`,
    description: data.seo_description || siteFallback.description,
    url: data.website_url || siteFallback.url,
    copyright: data.footer_text || siteFallback.copyright,
    footerNote: data.location
      ? `Personal Journal from ${data.location}.`
      : siteFallback.footerNote,
    ogImage: data.og_image_url ?? null,
  };
}

// ------------------------------------------------------------
// Hero
// ------------------------------------------------------------
export async function getHeroContent(): Promise<HeroContent> {
  const supabase = await getServerClient();
  if (!supabase) return heroFallback;

  const { data, error } = await supabase
    .from('home_content')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return heroFallback;

  return {
    ...heroFallback,
    eyebrow: data.eyebrow || heroFallback.eyebrow,
    titleLines: splitLines(data.title).length
      ? splitLines(data.title)
      : heroFallback.titleLines,
    bodyLines: splitLines(data.intro).length
      ? splitLines(data.intro)
      : heroFallback.bodyLines,
    cta: { ...heroFallback.cta, label: data.cta_label || heroFallback.cta.label },
    image: data.hero_image_url ?? heroFallback.image,
    imageCaption: data.hero_image_caption || heroFallback.imageCaption,
    keywords: data.keywords?.length ? data.keywords : heroFallback.keywords,
  };
}

// ------------------------------------------------------------
// About
// ------------------------------------------------------------
export async function getAboutContent(): Promise<AboutContent> {
  const supabase = await getServerClient();
  if (!supabase) return aboutFallback;

  const { data, error } = await supabase
    .from('about_content')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return aboutFallback;

  return {
    label: {
      index: aboutFallback.label.index,
      title: data.section_label || aboutFallback.label.title,
    },
    heading: data.title || aboutFallback.heading,
    paragraphs: data.paragraphs?.length ? data.paragraphs : aboutFallback.paragraphs,
    interests: data.interests?.length ? data.interests : aboutFallback.interests,
  };
}

// ------------------------------------------------------------
// Coffee
// ------------------------------------------------------------
export async function getCoffeeContent(): Promise<CoffeeContent> {
  const supabase = await getServerClient();
  if (!supabase) return coffeeFallback;

  const { data, error } = await supabase
    .from('coffee_entries')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data?.length) return coffeeFallback;

  return {
    ...coffeeFallback,
    cards: data.map((row, index) => ({
      id: padIndex(index),
      kicker: (row.entry_type === 'coffee_bean' ? 'COFFEE NOTES' : 'BREWING').toUpperCase(),
      title: row.title,
      body: row.notes ?? '',
      itemsLabel: row.flavor_notes.length ? 'FLAVOUR' : undefined,
      items: row.flavor_notes.length ? row.flavor_notes : undefined,
      image: row.cover_image_url,
      imageAlt: row.coffee_name || row.title,
    })),
  };
}

// ------------------------------------------------------------
// Places
// ------------------------------------------------------------
export async function getPlacesContent(): Promise<PlacesContent> {
  const supabase = await getServerClient();
  if (!supabase) return placesFallback;

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(4);

  if (error || !data?.length) return placesFallback;

  return {
    ...placesFallback,
    items: data.map((row, index) => ({
      id: padIndex(index),
      title: row.title,
      meta: row.category || 'Journal',
      image: row.cover_image_url,
      imageAlt: row.subtitle || row.title,
      comingSoon: true,
    })),
  };
}

// ------------------------------------------------------------
// Photography
// ------------------------------------------------------------
export async function getPhotographyContent(): Promise<PhotographyContent> {
  const supabase = await getServerClient();
  if (!supabase) return photographyFallback;

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(4);

  // 版面需要固定四張，不足時仍用原本的 placeholder 排版
  if (error || !data || data.length < 4) return photographyFallback;

  return {
    ...photographyFallback,
    camera: data[0].camera || photographyFallback.camera,
    photos: data.map((row, index) => ({
      id: padIndex(index),
      image: row.image_url,
      alt: row.title || row.caption || 'Photograph',
      place: row.location || 'Hualien',
      year: yearOf(row.taken_on),
    })),
  };
}

// ------------------------------------------------------------
// AI & Technology
// ------------------------------------------------------------
export async function getTechContent(): Promise<TechContent> {
  const supabase = await getServerClient();
  if (!supabase) return techFallback;

  const { data, error } = await supabase
    .from('technology_projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data?.length) return techFallback;

  return {
    ...techFallback,
    cards: data.map((row, index) => ({
      id: padIndex(index),
      title: row.name,
      stack: row.technologies.length ? row.technologies.join(' / ') : (row.category ?? ''),
      body: row.description ?? '',
    })),
  };
}

// ------------------------------------------------------------
// Selected Projects
// ------------------------------------------------------------
export async function getProjectsContent(): Promise<ProjectsContent> {
  const supabase = await getServerClient();
  if (!supabase) return projectsFallback;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data?.length) return projectsFallback;

  return {
    ...projectsFallback,
    items: data.map((row, index) => ({
      id: padIndex(index),
      title: row.title,
      category: row.category ?? '',
      year: row.year ?? '',
      href: row.url ?? undefined,
    })),
  };
}

// ------------------------------------------------------------
// Social links
// ------------------------------------------------------------
const iconByPlatform: Partial<Record<SocialPlatform, SocialIconName>> = {
  instagram: 'instagram',
  github: 'github',
  email: 'mail',
  google_maps: 'map',
};

export async function getSocialContent(): Promise<{
  contact: ContactContent;
  socials: SocialItem[];
}> {
  const supabase = await getServerClient();
  if (!supabase) return { contact: contactFallback, socials: socialsFallback };

  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });

  if (error || !data?.length) return { contact: contactFallback, socials: socialsFallback };

  return {
    contact: contactFallback,
    socials: data.map((row) => ({
      name: row.name,
      handle: row.handle ?? '',
      href: row.url,
      icon: iconByPlatform[row.platform],
      external: row.platform !== 'email',
    })),
  };
}
