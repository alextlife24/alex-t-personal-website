import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WebsitePet from '@/components/pet/WebsitePet';
import { getSiteSettings } from '@/lib/content';

/** 前台外框。後台 /admin 不會套用這一層。 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = await getSiteSettings();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        跳到主要內容
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer site={site} />
      {/* 只掛在前台的 (site) group，因此 /admin/* 不會出現貓咪 */}
      <WebsitePet />
    </>
  );
}
