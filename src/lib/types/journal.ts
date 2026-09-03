import type {
  BlockType,
  GalleryStyle,
  JournalCategory,
  PostStatus,
} from '@/lib/types/database';

/**
 * 前台使用的 Journal 視圖型別。
 * 資料庫的 jsonb 欄位在這裡收斂成明確結構。
 */

export const JOURNAL_CATEGORIES: JournalCategory[] = [
  'Coffee',
  'Hualien',
  'Photography',
  'Travel',
  'Technology',
  'Life',
];

export const GALLERY_STYLES: { value: GalleryStyle; label: string; hint: string }[] = [
  { value: 'editorial', label: 'Editorial', hint: '不對稱大小圖交錯，雜誌感' },
  { value: 'masonry', label: 'Masonry', hint: '瀑布流，保留每張原始比例' },
  { value: 'grid', label: 'Grid', hint: '等大方格' },
  { value: 'carousel', label: 'Carousel', hint: '橫向滑動，一次看一張' },
  { value: 'filmstrip', label: 'Film Strip', hint: '底片條，橫向縮圖' },
];

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  image: 'Image',
  gallery: 'Gallery',
  quote: 'Quote',
  divider: 'Divider',
  spacer: 'Spacer',
  location: 'Location',
  'coffee-note': 'Coffee Note',
};

export type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  focalX: number;
  focalY: number;
  isCover: boolean;
};

export type Gallery = {
  id: string;
  title: string | null;
  style: GalleryStyle;
  images: GalleryImage[];
};

/** 各種 block 的 content 結構 */
export type ParagraphContent = { text: string };
export type HeadingContent = { text: string; level: 2 | 3 };
export type ImageContent = {
  url: string | null;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  focalX: number;
  focalY: number;
};
export type GalleryContent = { galleryId: string | null };
export type QuoteContent = { text: string; attribution: string | null };
export type SpacerContent = { size: 'small' | 'medium' | 'large' };
export type LocationContent = {
  name: string;
  detail: string | null;
  mapsUrl: string | null;
};
export type CoffeeNoteContent = {
  coffeeName: string;
  origin: string | null;
  process: string | null;
  roaster: string | null;
  brewer: string | null;
  recipe: string | null;
  flavourNotes: string[];
};

/** image block 的顯示設定 */
export type ImageSettings = {
  ratio: 'original' | 'landscape' | 'portrait' | 'square' | 'panorama';
  fit: 'cover' | 'contain';
  width: 'normal' | 'wide' | 'full';
};

export type Block = {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  sortOrder: number;
  /** gallery block 會把展開後的 gallery 附在這裡 */
  gallery?: Gallery | null;
};

export type JournalPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover: {
    url: string | null;
    alt: string | null;
    width: number | null;
    height: number | null;
    focalX: number;
    focalY: number;
  };
  category: JournalCategory;
  tags: string[];
  publishedAt: string | null;
  status: PostStatus;
  featured: boolean;
  blocks: Block[];
};

/** 列表用的精簡版本 */
export type JournalSummary = Omit<JournalPost, 'blocks'>;

/** 建立新區塊時的預設內容 */
export function defaultContent(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'paragraph':
      return { text: '' };
    case 'heading':
      return { text: '', level: 2 };
    case 'image':
      return {
        url: null,
        alt: null,
        caption: null,
        width: null,
        height: null,
        focalX: 0.5,
        focalY: 0.5,
      };
    case 'gallery':
      return { galleryId: null };
    case 'quote':
      return { text: '', attribution: null };
    case 'spacer':
      return { size: 'medium' };
    case 'location':
      return { name: '', detail: null, mapsUrl: null };
    case 'coffee-note':
      return {
        coffeeName: '',
        origin: null,
        process: null,
        roaster: null,
        brewer: null,
        recipe: null,
        flavourNotes: [],
      };
    default:
      return {};
  }
}

export function defaultSettings(type: BlockType): Record<string, unknown> {
  if (type === 'image') {
    return { ratio: 'original', fit: 'cover', width: 'normal' };
  }
  return {};
}

/** 產生網址用的 slug；中文標題會退回時間戳記 */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  // 全部是中日韓字元時無法組成好讀的網址，改用日期 + 隨機碼
  if (!base || !/[a-z0-9]/.test(base)) {
    return `post-${new Date().toISOString().slice(0, 10)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;
  }
  return base.slice(0, 80);
}

export function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
