/** 05 — Photography 區塊。Editorial 版面：一張大直圖、兩張小圖、一張橫圖。 */
import type { PhotographyContent } from '@/lib/types/content';

export type { Photo } from '@/lib/types/content';

export const photography: PhotographyContent = {
  label: { index: '04', title: 'PHOTOGRAPHY' },
  headingLines: ['Imperfect cameras.', 'Real memories.'],
  paragraphs: [
    '不是每張照片都需要完美。',
    '有時候，一台舊相機反而更接近記憶本來的樣子。',
  ],
  camera: 'Nikon COOLPIX L11',
  meta: ['Hualien, Taiwan', 'Digital Photography', 'Personal Archive'],
  photos: [
    {
      id: '01',
      fallbackRatio: 'portrait',
      image: null, // → '/images/photo-01.jpg'（大型直圖）
      alt: '花蓮街道的直式照片',
      place: 'Hualien',
      year: '2026',
    },
    {
      id: '02',
      fallbackRatio: 'square',
      image: null, // → '/images/photo-02.jpg'（小圖）
      alt: '巷弄裡的角落',
      place: 'Hualien',
      year: '2026',
    },
    {
      id: '03',
      fallbackRatio: 'tall',
      image: null, // → '/images/photo-03.jpg'（小圖）
      alt: '海邊的午後',
      place: 'Hualien',
      year: '2026',
    },
    {
      id: '04',
      fallbackRatio: 'landscape',
      image: null, // → '/images/photo-04.jpg'（橫式大圖）
      alt: '橫式風景照片',
      place: 'Hualien',
      year: '2026',
    },
  ],
};
