/**
 * 08 — Contact / Social。
 * 只放這幾個平台，不要自行新增其他社群。
 * icon 只在 Lucide 有正確品牌圖示時才填；沒有的用文字＋箭頭呈現。
 */
export type SocialItem = {
  name: string;
  handle: string;
  href: string;
  /** 對應 SocialLink 內的圖示表；未列出者只顯示文字＋箭頭 */
  icon?: 'instagram' | 'github' | 'mail' | 'map';
  external: boolean;
};

export const contact = {
  label: { index: '07', title: 'CONNECT' },
  heading: "Let's share something interesting.",
  lines: [
    'Coffee.',
    'Photography.',
    'Hualien.',
    'AI.',
    'Creative Projects.',
    'If we like the same things,',
    'say hello.',
  ],
};

export const socials: SocialItem[] = [
  {
    name: 'TikTok',
    handle: '@evanln_24',
    href: 'https://www.tiktok.com/@evanln_24',
    external: true,
  },
  {
    name: 'Google Maps',
    handle: 'Local Guide',
    href: 'https://www.google.com/maps/contrib/@23.9736368,121.5712493,13z/data=!4m4!8m3!1e3!3m1!1e1?entry=ttu&g_ep=EgoyMDI2MDgzMC4wIKXMDSoASAFQAw%3D%3D',
    icon: 'map',
    external: true,
  },
  {
    name: 'X',
    handle: '@evanln_24',
    href: 'https://x.com/evanln_24',
    external: true,
  },
  {
    name: 'Threads',
    handle: '@evanln_24',
    href: 'https://www.threads.com/@evanln_24',
    external: true,
  },
  {
    name: 'Instagram',
    handle: '@uni_akumadesu',
    href: 'https://www.instagram.com/uni_akumadesu',
    icon: 'instagram',
    external: true,
  },
  {
    name: 'GitHub',
    handle: 'alextlife24',
    href: 'https://github.com/alextlife24',
    icon: 'github',
    external: true,
  },
  {
    name: 'Email',
    handle: 'toby0702889@gmail.com',
    href: 'mailto:toby0702889@gmail.com',
    icon: 'mail',
    external: false,
  },
];
