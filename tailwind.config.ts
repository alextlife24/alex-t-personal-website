import type { Config } from 'tailwindcss';

/**
 * 全站設計 Token。
 * 想調整整體色調時，直接改這裡的 colors 即可，所有元件會一起更新。
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F4F1EA', // 全站主背景
        sand: '#E8E2D8', // 次要區塊背景
        beige: '#D8CDBD', // 分隔線 / placeholder
        ink: '#24231F', // 主要文字
        coffee: '#765846', // 咖啡棕（重點色）
        sage: '#727A68', // 鼠尾草綠（次重點色）
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'var(--font-tc)', 'system-ui', 'sans-serif'],
        tc: ['var(--font-tc)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Editorial 用的極小標籤字
        label: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },
      letterSpacing: {
        label: '0.18em',
        wider2: '0.28em',
      },
      maxWidth: {
        shell: '84rem',
        prose2: '38rem',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        700: '700ms',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      aspectRatio: {
        portrait: '4 / 5',
        tall: '3 / 4',
        wide: '3 / 2',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
