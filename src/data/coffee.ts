/** 03 — Coffee 區塊內容與三張 Editorial Card。 */
export type CoffeeCard = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  /** 卡片下方的細節列表（器材 / 風味 / 里程碑） */
  items?: string[];
  itemsLabel?: string;
  image: string | null;
  imageAlt: string;
};

export const coffee = {
  label: { index: '02', title: 'COFFEE' },
  heading: 'Coffee is more than a drink.',
  lede: 'For me, brewing is a way of observing small changes.',
  cards: [
    {
      id: '01',
      kicker: 'BREWING',
      title: 'The Brewing Process',
      body: '探索研磨、水溫、流速與時間之間的細微變化。',
      itemsLabel: 'GEAR',
      items: [
        'Hario Switch',
        'V60',
        'Kalita Wave',
        'Comandante C40',
        '1Zpresso K-Max',
      ],
      image: null, // → '/images/coffee-01.jpg'
      imageAlt: '手沖咖啡器材',
    },
    {
      id: '02',
      kicker: 'COFFEE NOTES',
      title: 'Coffee Journal',
      body: '記錄不同產區、處理法、烘焙與沖煮方式帶來的風味。',
      itemsLabel: 'EXAMPLE',
      items: [
        'Ethiopia',
        'Washed',
        'Orange Blossom',
        'Cranberry',
        'Mandarin',
        'Honey',
      ],
      image: null, // → '/images/coffee-02.jpg'
      imageAlt: '咖啡風味筆記',
    },
    {
      id: '03',
      kicker: 'JOURNEY',
      title: 'Brewing Journey',
      body: '記錄咖啡學習、沖煮實驗與比賽準備的過程。',
      image: null,
      imageAlt: '沖煮練習紀錄',
    },
  ] satisfies CoffeeCard[],
};
