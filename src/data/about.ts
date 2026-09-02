/** 02 — About 區塊內容。 */
import type { AboutContent } from '@/lib/types/content';

export const about: AboutContent = {
  label: { index: '01', title: 'ABOUT' },
  heading: 'A little about me.',
  paragraphs: [
    '我是 Alex T。',
    '比起把自己定義成某一種身份，我更喜歡透過不同興趣去理解生活。',
    '我喜歡音樂、動畫與影劇，也喜歡拿著相機記錄城市裡不起眼的小地方。',
    '咖啡則是我投入很多時間的一件事。從豆子、器材、沖煮參數，到一杯咖啡最後呈現出的香氣與口感，每一個微小變化都讓我覺得很有趣。',
    '最近，我也開始探索 AI、Agent、自動化與網站製作，思考科技如何真正進入日常生活與創作。',
  ],
  interests: ['Coffee', 'Photography', 'Hualien', 'AI', 'Travel', 'Stories'],
};
