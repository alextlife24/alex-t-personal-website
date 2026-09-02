/** Header / MobileMenu 的導覽項目。順序即顯示順序。 */
export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Coffee', href: '#coffee' },
  { label: 'Places', href: '#places' },
  { label: 'Photography', href: '#photography' },
  { label: 'AI & Tech', href: '#tech' },
  { label: 'Projects', href: '#projects' },
];

/** 右上角 CTA，點擊捲動到頁面最底的 Contact 區塊。 */
export const contactAnchor = {
  label: 'Say Hello',
  href: '#connect',
};
