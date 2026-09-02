/** 07 — Selected Projects。純 Row List，之後要加連結就補上 href。 */
export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  href?: string;
};

export const projects = {
  label: { index: '06', title: 'SELECTED PROJECTS' },
  heading: "Things I've been exploring.",
  items: [
    { id: '01', title: '慶豐村慢旅行', category: 'Local / Travel', year: '2026' },
    { id: '02', title: 'Brand New Day Hualien', category: 'Photography', year: '2026' },
    { id: '03', title: 'Coffee Brewing Notes', category: 'Coffee', year: '2026' },
    { id: '04', title: 'Brewing Journey', category: 'Coffee', year: '2026' },
    { id: '05', title: 'Hermes Personal Agent', category: 'AI', year: '2026' },
    { id: '06', title: 'Personal Website', category: 'Digital / Creative', year: '2026' },
  ] satisfies Project[],
};
