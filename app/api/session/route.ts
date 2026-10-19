import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAuthConfigured,
  verifySessionToken,
} from '../../lib/auth';

// 用到 node:crypto，必须跑在 Node 运行时
export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;
const ATTEMPTS_CEILING = 1_000;

// 按 IP 粗暴限流。serverless 多实例下不严格，但足够挡住脚本化的口令爆破。
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

function tooManyAttempts(key: string): boolean {
  const now = Date.now();

  // 表膨胀到一定程度就清一遍过期项，避免无限增长
  if (attempts.size > ATTEMPTS_CEILING) {
    for (const [k, v] of attempts) {
      if (now > v.resetAt) attempts.delete(k);
    }
  }

  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

/** 查询当前是否已登录 —— 客户端组件靠它决定显示口令框还是发布框 */
export async function GET() {
  if (!isAuthConfigured()) {
    return NextResponse.json({ success: true, authed: false, enabled: false });
  }

  const cookieStore = await cookies();
  const authed = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  return NextResponse.json({ success: true, authed, enabled: true });
}

/** 用口令换会话 */
export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: '服务端未配置 POST_PASSWORD / AUTH_SECRET' },
      { status: 503 }
    );
  }

  if (tooManyAttempts(clientKey(request))) {
    return NextResponse.json(
      { success: false, error: '尝试太频繁，请一分钟后再试' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const password = (body as { password?: unknown })?.password;
  if (typeof password !== 'string' || !checkPassword(password)) {
    return NextResponse.json({ success: false, error: '口令不对' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true, // 前端 JS 读不到，XSS 也偷不走
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

/** 退出登录 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
