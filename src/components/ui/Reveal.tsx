'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

const motionTags = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  article: motion.article,
  figure: motion.figure,
  span: motion.span,
} as const;

type RevealProps = {
  children: ReactNode;
  /** 延遲秒數，用來讓同一組元素依序淡入 */
  delay?: number;
  /** 位移距離（px），0 代表只做透明度淡入 */
  y?: number;
  duration?: number;
  className?: string;
  as?: keyof typeof motionTags;
};

/**
 * 進入畫面時的淡入元件。
 * 動畫刻意保持節制：只有透明度與極小位移，300–700ms。
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.7,
  className,
  as = 'div',
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motionTags[as] as ElementType;

  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
