import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Noto_Sans_TC } from 'next/font/google';
import { getSiteSettings } from '@/lib/content';
import './globals.css';

/* 英文標題：Serif。要換字體只需改這裡與 tailwind.config.ts 的 fontFamily。 */
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

/* 主要 UI / 英文內文 */
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

/* 繁體中文內文 */
const tc = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-tc',
  display: 'swap',
});

/** SEO 內容同樣支援後台管理，未設定 Supabase 時使用 src/data/site.ts。 */
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();

  return {
    metadataBase: new URL(site.url),
    title: {
      default: site.title,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    keywords: [...site.keywords],
    authors: [{ name: site.name }],
    creator: site.name,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'zh_TW',
      url: site.url,
      siteName: site.title,
      title: site.title,
      description: site.description,
      ...(site.ogImage ? { images: [{ url: site.ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: site.title,
      description: site.description,
      ...(site.ogImage ? { images: [site.ogImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#F4F1EA',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-Hant"
      className={`${serif.variable} ${sans.variable} ${tc.variable}`}
    >
      <body>
        {/* 沒有啟用 JavaScript 時，關閉淡入動畫的初始隱藏狀態，確保內容仍可閱讀 */}
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
