/** 04 — Places / Hualien 區塊內容。目前只做視覺卡片，不建立文章頁。 */
export type PlaceItem = {
  id: string;
  title: string;
  meta: string;
  image: string | null;
  imageAlt: string;
  /** 之後要開放文章時，把 href 填上並將 comingSoon 改成 false。 */
  href?: string;
  comingSoon: boolean;
};

export const places = {
  label: { index: '03', title: 'PLACES' },
  heading: 'Hualien, through my eyes.',
  paragraphs: [
    '我生活的地方，也是我最喜歡慢慢探索的地方。',
    '比起熱門景點，我更喜歡記錄巷弄、咖啡店、老建築、街道、海，以及那些很容易被忽略的小地方。',
  ],
  items: [
    {
      id: '01',
      title: 'A slow afternoon in Hualien',
      meta: 'Journal',
      image: null, // → '/images/hualien-01.jpg'
      imageAlt: '花蓮的午後街景',
      comingSoon: true,
    },
    {
      id: '02',
      title: 'Coffee shops worth returning to',
      meta: 'Coffee',
      image: null, // → '/images/hualien-02.jpg'
      imageAlt: '花蓮的咖啡店',
      comingSoon: true,
    },
    {
      id: '03',
      title: 'Brand New Day Hualien',
      meta: 'Photography',
      image: null, // → '/images/hualien-03.jpg'
      imageAlt: 'Brand New Day Hualien',
      comingSoon: true,
    },
    {
      id: '04',
      title: '慶豐村慢旅行',
      meta: 'Local / Travel',
      image: null,
      imageAlt: '慶豐村的巷弄',
      comingSoon: true,
    },
  ] satisfies PlaceItem[],
};
