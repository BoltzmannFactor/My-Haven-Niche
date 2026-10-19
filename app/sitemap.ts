import type { MetadataRoute } from 'next';

// 部署后请把 NEXT_PUBLIC_SITE_URL 配成真实域名，
// 否则 sitemap 里会是示例地址，搜索引擎拿不到有效链接。
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

const routes = [
  { path: '', priority: 1, freq: 'daily' as const },
  { path: '/shuoshuo', priority: 0.8, freq: 'daily' as const },
  { path: '/essays', priority: 0.8, freq: 'weekly' as const },
  { path: '/projects', priority: 0.8, freq: 'monthly' as const },
  { path: '/archives', priority: 0.7, freq: 'weekly' as const },
  { path: '/photos', priority: 0.5, freq: 'monthly' as const },
  { path: '/music', priority: 0.5, freq: 'monthly' as const },
  { path: '/realm', priority: 0.5, freq: 'monthly' as const },
  { path: '/links', priority: 0.4, freq: 'monthly' as const },
  { path: '/about', priority: 0.6, freq: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // 这里用构建时间即可：内容是静态的，不需要每次请求都算。
  // 若将来改为动态内容，再改成读取文章的最新更新时间。
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.freq,
    priority: route.priority,
  }));
}
