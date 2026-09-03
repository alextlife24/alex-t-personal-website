import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/content';
import { getPublishedSlugs } from '@/lib/journal';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, posts] = await Promise.all([getSiteSettings(), getPublishedSlugs()]);

  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${site.url}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${site.url}/journal/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
