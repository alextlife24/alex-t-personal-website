/**
 * 資料庫型別。對應 supabase/migrations/0001_init.sql。
 * 之後若改動 schema，記得同步更新這裡。
 */

export type EntryType = 'brewing_note' | 'coffee_bean';
export type TechStatus = 'exploring' | 'active' | 'completed' | 'archived';
export type SocialPlatform =
  | 'tiktok'
  | 'google_maps'
  | 'x'
  | 'threads'
  | 'instagram'
  | 'github'
  | 'email';

type Timestamps = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type SiteSettingsRow = Timestamps & {
  site_name: string;
  site_title: string;
  description: string | null;
  seo_description: string | null;
  website_url: string | null;
  footer_text: string | null;
  location: string | null;
  og_image_url: string | null;
  favicon_url: string | null;
};

export type HomeContentRow = Timestamps & {
  eyebrow: string | null;
  title: string | null;
  intro: string | null;
  cta_label: string | null;
  hero_image_url: string | null;
  hero_image_caption: string | null;
  keywords: string[];
};

export type AboutContentRow = Timestamps & {
  section_label: string | null;
  title: string | null;
  paragraphs: string[];
  interests: string[];
};

export type CoffeeEntryRow = Timestamps & {
  entry_type: EntryType;
  title: string;
  coffee_name: string | null;
  origin: string | null;
  region: string | null;
  producer: string | null;
  variety: string | null;
  process: string | null;
  roast_level: string | null;
  roaster: string | null;
  roast_date: string | null;
  brew_date: string | null;
  brewer: string | null;
  grinder: string | null;
  grind_setting: string | null;
  dose: string | null;
  water: string | null;
  water_temperature: string | null;
  brew_time: string | null;
  recipe: string | null;
  flavor_notes: string[];
  rating: number | null;
  notes: string | null;
  cover_image_url: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
};

export type PlaceRow = Timestamps & {
  title: string;
  subtitle: string | null;
  category: string | null;
  location: string | null;
  google_maps_url: string | null;
  short_description: string | null;
  story: string | null;
  visit_date: string | null;
  cover_image_url: string | null;
  gallery: string[];
  published: boolean;
  featured: boolean;
  sort_order: number;
};

export type PhotoRow = Timestamps & {
  title: string | null;
  image_url: string;
  location: string | null;
  camera: string | null;
  lens: string | null;
  taken_on: string | null;
  caption: string | null;
  category: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
};

export type TechnologyProjectRow = Timestamps & {
  name: string;
  technologies: string[];
  category: string | null;
  description: string | null;
  project_url: string | null;
  github_url: string | null;
  cover_image_url: string | null;
  start_date: string | null;
  status: TechStatus;
  published: boolean;
  featured: boolean;
  sort_order: number;
};

export type ProjectRow = Timestamps & {
  title: string;
  category: string | null;
  year: string | null;
  description: string | null;
  cover_image_url: string | null;
  url: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
};

export type SocialLinkRow = Timestamps & {
  platform: SocialPlatform;
  name: string;
  handle: string | null;
  url: string;
  icon: string | null;
  enabled: boolean;
  sort_order: number;
};

export type MediaRow = Timestamps & {
  file_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string | null;
  size_bytes: number | null;
};

type TableShape<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      site_settings: TableShape<SiteSettingsRow>;
      home_content: TableShape<HomeContentRow>;
      about_content: TableShape<AboutContentRow>;
      coffee_entries: TableShape<CoffeeEntryRow>;
      places: TableShape<PlaceRow>;
      photos: TableShape<PhotoRow>;
      technology_projects: TableShape<TechnologyProjectRow>;
      projects: TableShape<ProjectRow>;
      social_links: TableShape<SocialLinkRow>;
      media: TableShape<MediaRow>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

/** 後台列表用的通用 Table 名稱 */
export type ContentTable =
  | 'coffee_entries'
  | 'places'
  | 'photos'
  | 'technology_projects'
  | 'projects';
