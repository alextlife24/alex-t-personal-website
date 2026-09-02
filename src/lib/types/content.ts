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
  tagline: string;
  subtitle: string;
  title: string;
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

export type CoffeeCard = {
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

export type PlaceItem = {
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

export type Photo = {
  id: string;
  image: string | null;
  alt: string;
  place: string;
  year: string;
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
