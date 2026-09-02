/**
 * next/image 只允許載入這裡列出的外部網域。
 *
 * 後台上傳的圖片存在 Supabase Storage，屬於外部網域，
 * 因此依 NEXT_PUBLIC_SUPABASE_URL 自動推導出主機名稱並授權。
 * 這樣換 Supabase 專案或切換環境都不需要再改這個檔案。
 */
const remotePatterns = [];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    remotePatterns.push({
      protocol: 'https',
      hostname,
      // 只開放公開的 Storage 路徑，不放行整個網域
      pathname: '/storage/v1/object/public/**',
    });
  } catch {
    // URL 格式錯誤時忽略，前台會退回 src/data 的本地圖片
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
