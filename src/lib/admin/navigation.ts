/** 後台 Sidebar 的分組與項目。要增減後台頁面改這裡即可。 */
export type AdminNavItem = {
  label: string;
  href: string;
};

export type AdminNavGroup = {
  title: string | null;
  items: AdminNavItem[];
};

export const adminNav: AdminNavGroup[] = [
  {
    title: null,
    items: [{ label: 'Overview', href: '/admin' }],
  },
  {
    title: 'Website',
    items: [
      { label: 'Home', href: '/admin/home' },
      { label: 'About', href: '/admin/about' },
      { label: 'Social', href: '/admin/social' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Coffee', href: '/admin/coffee' },
      { label: 'Places', href: '/admin/places' },
      { label: 'Photography', href: '/admin/photography' },
      { label: 'AI & Tech', href: '/admin/technology' },
      { label: 'Projects', href: '/admin/projects' },
    ],
  },
  {
    title: 'Media',
    items: [{ label: 'Media Library', href: '/admin/media' }],
  },
  {
    title: 'Settings',
    items: [{ label: 'Site Settings', href: '/admin/settings' }],
  },
];

export const studio = {
  name: 'Alex T Studio',
  subtitle: 'Personal Website Management',
  tagline: 'A quiet place to manage Coffee, Places, Photos and Ideas.',
};
