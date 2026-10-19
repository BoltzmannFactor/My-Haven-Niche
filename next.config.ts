import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // content/ 下的 Markdown 是运行时用 fs 读取的，默认不会被打包进产物。
  // 不加这一项，部署到 Vercel 等平台后会读不到文章文件。
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
  },
};

export default nextConfig;
