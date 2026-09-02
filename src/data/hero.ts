/**
 * 首頁 Hero 區塊內容。
 * image：目前為 null → 顯示 Placeholder。
 * 把圖片放進 public/images/ 後，改成 '/images/hero-placeholder.jpg' 即可。
 */
import type { HeroContent } from '@/lib/types/content';

export const hero: HeroContent = {
  eyebrow: 'A PERSONAL JOURNAL',
  titleLines: ['Collecting moments,', 'brewing ideas.'],
  bodyLines: [
    '喝咖啡、拍照、走走花蓮，',
    '偶爾研究 AI。',
    '這裡收藏我喜歡的事物，',
    '也記錄正在發生的生活。',
  ],
  cta: { label: 'Explore My World', href: '#about' },
  image: null, // → '/images/hero-placeholder.jpg'
  imageAlt: 'Alex T 的生活影像',
  imageCaption: 'Hualien, Taiwan',
  keywords: ['Coffee', 'Photography', 'Hualien', 'Technology'],
};
