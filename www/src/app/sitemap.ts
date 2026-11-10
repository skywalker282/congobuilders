import type { MetadataRoute } from 'next';
import { locales } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://congo-btp.com';
  const pages = ['', 'about', 'services', 'projects', 'properties', 'contact', 'news'];
  return locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${siteUrl}/${locale}${page ? `/${page}` : ''}`,
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1 : 0.7,
    })),
  );
}
