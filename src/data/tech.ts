/** 06 — AI & Technology 區塊。 */
import type { TechContent } from '@/lib/types/content';

export type { TechCard } from '@/lib/types/content';

export const tech: TechContent = {
  label: { index: '05', title: 'AI & TECH' },
  heading: 'Exploring what AI can become.',
  paragraphs: [
    '我對 AI 最感興趣的，不是它能回答多少問題，而是它是否能真正成為協助工作、創作與生活的工具。',
  ],
  cards: [
    {
      id: '01',
      title: 'Personal AI Agent',
      stack: 'Hermes Agent + Telegram',
      body: '探索如何建立可以長時間運作、透過 Telegram 使用的個人 AI Agent。',
    },
    {
      id: '02',
      title: 'AI Website Experiment',
      stack: 'Claude Code / AI-assisted Development',
      body: '嘗試利用 AI 從想法、設計到程式碼建立完整網站。',
    },
    {
      id: '03',
      title: 'AI × Daily Life',
      stack: 'Automation / Research / Creativity',
      body: '研究 AI 如何協助資料整理、研究與個人創作流程。',
    },
  ],
};
