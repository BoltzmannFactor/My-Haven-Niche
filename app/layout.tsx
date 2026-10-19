import type { Metadata, Viewport } from 'next';
import "./globals.css";
import AppShell from './components/AppShell';

// 站点地址：用于 OG 图与 sitemap 生成绝对链接。
// 优先级：手工配置的 NEXT_PUBLIC_SITE_URL > Vercel 自动注入的生产域名。
// 两者都没有时留空（本地开发），此时 Next 会退回 http://localhost:3000。
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl;

// 说明：原先使用 next/font/google 加载 Geist，但该方案构建时需要访问
// fonts.googleapis.com，在无法访问的环境会直接导致 build 失败。
// 现改为 globals.css 中的系统字体栈（含中文），不依赖外网。

// 首屏脚本必须在 CSS 生效前跑完，否则深色主题用户会先看到一帧浅色背景。
// 做法是在 <head> 内联一小段同步脚本，直接给 <html> 打上 data-theme。
const themeInitScript = `(function(){try{var t=localStorage.getItem('windlog-theme');if(t==='fantasy'){document.documentElement.setAttribute('data-theme','fantasy');}}catch(e){}})();`;

// 同理，开场动画是否播放也在这里判定，见 globals.css 的 html[data-splash="done"]。
const splashInitScript = `(function(){try{var seen=localStorage.getItem('windlog-splash-seen');var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(seen||reduce){document.documentElement.setAttribute('data-splash','done');}else{document.documentElement.setAttribute('data-splash','play');}}catch(e){document.documentElement.setAttribute('data-splash','play');}})();`;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: '风与日记 · Windlog',
    template: '%s · 风与日记',
  },
  description: '晨雾森林里的钢琴 —— Windseeker 的个人手稿：说说、杂谈、项目与光影。',
  keywords: ['风与日记', 'Windlog', 'Windseeker', '个人博客', '说说', '杂谈'],
  authors: [{ name: 'Windseeker' }],
  openGraph: {
    title: '风与日记 · Windlog',
    description: '晨雾森林里的钢琴 —— Windseeker 的个人手稿。',
    siteName: '风与日记',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '风与日记 · Windlog',
    description: '晨雾森林里的钢琴 —— Windseeker 的个人手稿。',
  },
};

export const viewport: Viewport = {
  themeColor: '#E8D5F5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning：上面的内联脚本会修改 <html> 属性，服务端渲染结果必然不一致
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: splashInitScript }} />
      </head>
      {/* 背景渐变交给 globals.css 的 body 规则，这里不要再写死颜色 class，
          Tailwind 工具类优先级高于元素选择器，会覆盖主题变量。 */}
      <body className="antialiased min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
