import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '../../lib/auth';

export const runtime = 'nodejs';

const MAX_CONTENT_LENGTH = 1000;
const TARGET_DIR = 'content/shuoshuo';
const API_VERSION = '2022-11-28';

// 文件名和 frontmatter 都按北京时间落，避免服务器 UTC 导致「晚上发的说说记成前一天」
const TIME_ZONE = 'Asia/Shanghai';
const UTC_OFFSET = '+08:00';

function beijingParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  // 少数实现在 hour12: false 下会给出 "24"
  const hour = get('hour') === '24' ? '00' : get('hour');

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour,
    minute: get('minute'),
    second: get('second'),
  };
}

/** 形如 2026-10-18-224753.md —— 精确到秒，同一天发多条也不会撞名 */
function buildFilename(date: Date): string {
  const p = beijingParts(date);
  return `${p.year}-${p.month}-${p.day}-${p.hour}${p.minute}${p.second}.md`;
}

function buildMarkdown(content: string, date: Date): string {
  const p = beijingParts(date);
  const iso = `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${UTC_OFFSET}`;
  return `---\ndate: ${iso}\n---\n\n${content}\n`;
}

const RATE_WINDOW_MS = 60_000;
const MAX_POSTS_PER_WINDOW = 10;
const posts = new Map<string, { count: number; resetAt: number }>();

function tooManyPosts(key: string): boolean {
  const now = Date.now();
  const entry = posts.get(key);
  if (!entry || now > entry.resetAt) {
    posts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_POSTS_PER_WINDOW;
}

/**
 * 发布说说：校验会话后，把内容作为 Markdown 文件提交到 content/shuoshuo/。
 * 一次提交同时完成两件事 —— 触发 Vercel 重建（访客看到），
 * 以及落到仓库（Obsidian 下次 pull 拉到）。
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
  }

  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) {
    return NextResponse.json(
      { success: false, error: '服务端未配置 GITHUB_REPO / GITHUB_TOKEN' },
      { status: 503 }
    );
  }

  const clientKey =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (tooManyPosts(clientKey)) {
    return NextResponse.json(
      { success: false, error: '发得太快了，歇一分钟再来' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const raw = (body as { content?: unknown })?.content;
  if (typeof raw !== 'string' || !raw.trim()) {
    return NextResponse.json({ success: false, error: '内容不能为空' }, { status: 400 });
  }
  if (raw.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { success: false, error: `内容不能超过 ${MAX_CONTENT_LENGTH} 字` },
      { status: 400 }
    );
  }

  const now = new Date();
  const filename = buildFilename(now);
  // 路径完全由服务端生成，不接受用户输入，不存在路径穿越的可能
  const path = `${TARGET_DIR}/${filename}`;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  const excerpt = raw.trim().replace(/\s+/g, ' ').slice(0, 30);

  let upstream: Response;
  try {
    upstream = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'windlog-shuoshuo',
        'X-GitHub-Api-Version': API_VERSION,
      },
      body: JSON.stringify({
        message: `说说：${excerpt}`,
        content: Buffer.from(buildMarkdown(raw.trim(), now), 'utf-8').toString('base64'),
      }),
    });
  } catch {
    return NextResponse.json({ success: false, error: '连不上 GitHub，稍后再试' }, { status: 502 });
  }

  if (!upstream.ok) {
    const detail = (await upstream.json().catch(() => null)) as { message?: string } | null;
    console.error('[windlog] GitHub 提交失败：', upstream.status, detail?.message);
    return NextResponse.json(
      { success: false, error: detail?.message ?? `GitHub 返回 ${upstream.status}` },
      { status: 502 }
    );
  }

  const payload = (await upstream.json()) as {
    content?: { html_url?: string };
    commit?: { html_url?: string };
  };

  return NextResponse.json({
    success: true,
    file: path,
    url: payload.content?.html_url ?? null,
    commit: payload.commit?.html_url ?? null,
  });
}
