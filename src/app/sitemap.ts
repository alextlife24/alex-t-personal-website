import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteSettings();

  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
