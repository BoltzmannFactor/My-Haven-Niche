import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * 内容管线：所有文章都放在 content/<collection>/*.md，
 * frontmatter 提供元数据，正文是 Markdown。
 *
 * 这些函数在服务端（含构建时）执行，不会被打包进客户端 bundle。
 * 注意：部署时需要在 next.config.ts 里声明 outputFileTracingIncludes，
 * 否则产物里不会带上 content/ 目录，线上会读不到文件。
 */

export type Collection = 'shuoshuo' | 'essays' | 'projects';

export interface ContentItem {
  /** 文件名去掉 .md，同时用作锚点 id */
  id: string;
  collection: Collection;
  title: string;
  summary: string;
  content: string;
  /** ISO 8601 */
  date: string;
  tags: string[];
  /** 列表页锚点链接 */
  href: string;
  /** 仅 projects 使用；缺省时为空数组，避免调用方到处判空 */
  link?: string;
  stack: string[];
  status?: string;
}

// Turbopack 会把 process.cwd() 参与的路径当作「可能读取任意文件」的线索，
// 进而去追溯整个项目并告警。这里显式关掉它的追踪即可 ——
// content/ 目录的打包另有 next.config.ts 的 outputFileTracingIncludes 负责。
// 注意：加注释必须保持这个写法（紧贴 process.cwd() 之前），否则 Turbopack 识别不到。
const DIRECTORIES: Record<Collection, string> = {
  shuoshuo: path.join(/*turbopackIgnore: true*/ process.cwd(), 'content', 'shuoshuo'),
  essays: path.join(/*turbopackIgnore: true*/ process.cwd(), 'content', 'essays'),
  projects: path.join(/*turbopackIgnore: true*/ process.cwd(), 'content', 'projects'),
};

// Turbopack 要求 path.join 的参数是可静态分析的字面量，
// 所以目录写死在上面这张表里，不要在运行时拼变量。
function directoryOf(collection: Collection): string {
  return DIRECTORIES[collection];
}

/** Turbopack 无法静态分析 axios 式动态路径，这里显式排除追踪，避免把整个项目算进产物依赖 */
function exists(directory: string): boolean {
  return fs.existsSync(/*turbopackIgnore: true*/ directory);
}

function toDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
  }
  return new Date(0).toISOString();
}

function toTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((t): t is string => typeof t === 'string');
  }
  if (typeof value === 'string') {
    return value.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function getCollection(collection: Collection): ContentItem[] {
  const directory = directoryOf(collection);
  if (!exists(directory)) return [];

  return fs
    .readdirSync(/*turbopackIgnore: true*/ directory)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(/*turbopackIgnore: true*/ directory, file);
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf-8');
      const { data, content } = matter(raw);
      const id = file.replace(/\.md$/, '');

      return {
        id,
        collection,
        title: toStringOrUndefined(data.title) ?? id,
        summary: toStringOrUndefined(data.summary) ?? '',
        content: content.trim(),
        date: toDate(data.date),
        tags: toTags(data.tags),
        href: `/${collection}#${id}`,
        link: toStringOrUndefined(data.link),
        stack: toTags(data.stack),
        status: toStringOrUndefined(data.status),
      };
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/** 全部内容，按时间倒序 —— 归档页的数据源 */
export function getAllContent(): ContentItem[] {
  return (Object.keys(DIRECTORIES) as Collection[])
    .flatMap((collection) => getCollection(collection))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getLatest(collection: Collection, limit: number): ContentItem[] {
  return getCollection(collection).slice(0, limit);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counter = new Map<string, number>();
  for (const item of getAllContent()) {
    for (const tag of item.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }
  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hans-CN'));
}
