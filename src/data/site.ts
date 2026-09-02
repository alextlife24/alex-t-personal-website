/**
 * 全站基本設定：站名、標語、SEO。
 * 要改網站標題、描述、關鍵字，只改這個檔案。
 */
import type { SiteContent } from '@/lib/types/content';

export const site: SiteContent = {
  name: 'Alex T',
  tagline: 'Coffee. Places. Ideas.',
  subtitle: 'A personal journal by Alex T.',
  title: 'Alex T — Coffee, Places & Ideas',
  description:
    'A personal journal by Alex T exploring coffee, photography, Hualien, technology and everyday life.',
  keywords: [
    'Alex T',
    'Coffee',
    'Hualien',
    'Photography',
    'AI',
    'Personal Journal',
    'Taiwan',
  ],
  locale: 'zh-Hant',
  url: 'https://alext.example.com', // 上線後換成正式網域
  email: 'toby0702889@gmail.com',
  footerNote: 'Personal Journal from Taiwan.',
  copyright: '© 2026 Alex T.',
  /** Open Graph 圖片，可在後台 Site Settings 設定 */
  ogImage: null,
};
