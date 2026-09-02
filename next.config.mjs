/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 目前所有圖片都放在 public/images/，不需要 remotePatterns。
    // 之後若要使用外部圖床，在這裡加入 remotePatterns 即可。
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
