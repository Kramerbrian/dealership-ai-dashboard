import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com';
  const lastModified = new Date();
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compliance`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/intelligence`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];
  
  // Dynamic pages (if any)
  const dynamicPages: MetadataRoute.Sitemap = [];
  
  // Blog posts (if any)
  const blogPages: MetadataRoute.Sitemap = [];
  
  return [...staticPages, ...dynamicPages, ...blogPages];
}