import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next 16 起 middleware 已更名为 proxy，这里同步迁移。
// 维护开关改为环境变量，不用在发布前改代码：
// 在 Vercel 项目里设置 MAINTENANCE_MODE=1 就能全站重写到 /maintenance。
const isMaintenance = process.env.MAINTENANCE_MODE === '1';

export function proxy(request: NextRequest) {
  if (isMaintenance && request.nextUrl.pathname !== '/maintenance') {
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
