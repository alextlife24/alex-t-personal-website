/**
 * 前台各區塊的內容型別。
 *
 * src/data/*.ts（靜態 fallback）與 src/lib/content.ts（Supabase 來源）
 * 都必須符合這些型別，因此兩邊可以互相替換而不會壞版。
 */

export type SectionLabelContent = {
  index: string;
  title: string;
};

export type SiteContent = {
  name: string;
  /** Footer 的品牌標語，維持靜態，不在後台管理範圍 */
  tagline: string;
  subtitle: string;
  /** 完整瀏覽器標題 */
  title: string;
  /** 標題後綴，對應後台 Site Settings 的 Site Title */
  titleSuffix: string;
  description: string;
  keywords: string[];
  locale: string;
  url: string;
  email: string;
  footerNote: string;
  copyright: string;
  ogImage: string | null;
};

export type HeroContent = {
  eyebrow: string;
  titleLines: string[];
  bodyLines: string[];
  cta: { label: string; href: string };
  image: string | null;
  imageAlt: string;
  imageCaption: string;
  keywords: string[];
};

export type AboutContent = {
  label: SectionLabelContent;
  heading: string;
  paragraphs: string[];
  interests: string[];
};

export type CoffeeCard = ImageMeta & {
  id: string;
  kicker: string;
  title: string;
  body: string;
  itemsLabel?: string;
  items?: string[];
  image: string | null;
  imageAlt: string;
};

export type CoffeeContent = {
  label: SectionLabelContent;
  heading: string;
  lede: string;
  cards: CoffeeCard[];
};

/** 通用圖片欄位：讓版面可以用真實比例排版，不必預先裁切 */
export type ImageMeta = {
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
};

export type PlaceItem = ImageMeta & {
  id: string;
  title: string;
  meta: string;
  image: string | null;
  imageAlt: string;
  href?: string;
  comingSoon: boolean;
};

export type PlacesContent = {
  label: SectionLabelContent;
  heading: string;
  paragraphs: string[];
  items: PlaceItem[];
};

export type Photo = ImageMeta & {
  id: string;
  image: string | null;
  alt: string;
  place: string;
  year: string;
  /** 沒有尺寸資料時 masonry 用的備援比例 */
  fallbackRatio?: 'landscape' | 'portrait' | 'square' | 'tall';
};

export type PhotographyContent = {
  label: SectionLabelContent;
  headingLines: string[];
  paragraphs: string[];
  camera: string;
  meta: string[];
  photos: Photo[];
};

export type TechCard = {
  id: string;
  title: string;
  stack: string;
  body: string;
};

export type TechContent = {
  label: SectionLabelContent;
  heading: string;
  paragraphs: string[];
  cards: TechCard[];
};

export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  href?: string;
};

export type ProjectsContent = {
  label: SectionLabelContent;
  heading: string;
  items: Project[];
};

export type SocialIconName = 'instagram' | 'github' | 'mail' | 'map';

export type SocialItem = {
  name: string;
  handle: string;
  href: string;
  icon?: SocialIconName;
  external: boolean;
};

export type ContactContent = {
  label: SectionLabelContent;
  heading: string;
  lines: string[];
};
