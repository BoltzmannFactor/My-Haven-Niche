import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * 项目工作台（Project Workbench）
 * ---------------------------------------------------------------------------
 * 唯一数据源：content/projects.json
 *   - 列表页 /projects 直接渲染它
 *   - content.ts 的 projects 集合也从这里取，所以首页统计、归档、标签云、
 *     sitemap 都不用改就能看到新项目
 * 项目长文（可选）：content/projects/<id>.md，正文会折叠显示在卡片里。
 *
 * 自动同步：scripts/sync-projects.mjs 每天扫一遍条目里的 source 目录，
 * 用 git 最后提交时间 / 目录 mtime 刷新 updated，用 package.json 刷新 version。
 *
 * ⚠️ 本文件用到 fs，属于服务端模块，禁止被客户端组件引用（含间接引用）。
 */

export const PROJECT_STATUSES = ['进行中', '维护中', '已上线', '搁置'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  title: string;
  summary: string;
  /** 尽量落在 PROJECT_STATUSES 里；写成别的值也不会崩，只是排到最后 */
  status: string;
  /** YYYY-MM-DD */
  started: string;
  /** YYYY-MM-DD，自动同步会刷新它 */
  updated: string;
  version?: string;
  stack: string[];
  tags: string[];
  repo?: string;
  demo?: string;
  /** 卡片左上角的图标（emoji 或 Unicode 符号） */
  icon: string;
  /** 糖果色编号，对应 --pop-1 ~ --pop-5 / --tint-1 ~ --tint-5 */
  accent: 1 | 2 | 3 | 4 | 5;
  /** 置顶到列表最前 */
  featured: boolean;
  /** 本地工程目录；填了才会被同步脚本扫描 */
  source?: string;
  /** 项目笔记（Markdown），来自 JSON notes 或 content/projects/<id>.md */
  content: string;
}

const MANIFEST = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  'content',
  'projects.json',
);
const BODY_DIR = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  'content',
  'projects',
);

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json {
  return typeof value === 'object' && value !== null ? (value as Json) : {};
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function strArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && !!item.trim());
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

/** 统一成 YYYY-MM-DD，非法值退回空串（页面会自己兜底） */
function toDay(value: unknown): string {
  const raw = str(value);
  if (!raw) return '';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function toAccent(value: unknown): Project['accent'] {
  const n = typeof value === 'number' ? value : Number(value);
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5) return n;
  return 1;
}

/** 项目笔记：JSON 的 notes 优先，否则读 content/projects/<id>.md 的正文 */
function readBody(id: string, notes: unknown): string {
  const inline = str(notes);
  if (inline) return inline;

  const file = path.join(/*turbopackIgnore: true*/ BODY_DIR, `${id}.md`);
  try {
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ file, 'utf-8');
    return matter(raw).content.trim();
  } catch {
    return '';
  }
}

function statusWeight(status: string): number {
  const index = (PROJECT_STATUSES as readonly string[]).indexOf(status);
  return index === -1 ? PROJECT_STATUSES.length : index;
}

export function getProjects(): Project[] {
  let manifest: Json = {};
  try {
    manifest = asRecord(JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ MANIFEST, 'utf-8')));
  } catch {
    // 文件缺失或 JSON 写坏了：返回空列表，页面显示空态而不是整站构建失败
    return [];
  }

  const list = Array.isArray(manifest.projects) ? manifest.projects : [];
  const seen = new Set<string>();

  return list
    .map((entry): Project | null => {
      const item = asRecord(entry);
      const id = str(item.id);
      if (!id || seen.has(id)) return null;
      seen.add(id);

      const started = toDay(item.started);
      return {
        id,
        title: str(item.title, id),
        summary: str(item.summary),
        status: str(item.status, '进行中'),
        started,
        updated: toDay(item.updated) || started,
        version: str(item.version) || undefined,
        stack: strArray(item.stack),
        tags: strArray(item.tags),
        repo: str(item.repo) || undefined,
        demo: str(item.demo) || undefined,
        icon: str(item.icon, '🛠️'),
        accent: toAccent(item.accent),
        featured: item.featured === true,
        source: str(item.source) || undefined,
        content: readBody(id, item.notes),
      };
    })
    .filter((item): item is Project => item !== null)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const byStatus = statusWeight(a.status) - statusWeight(b.status);
      if (byStatus !== 0) return byStatus;
      return (b.updated || b.started).localeCompare(a.updated || a.started);
    });
}

/** 上次同步日期（脚本写回），页面上做个「数据新鲜度」提示 */
export function getProjectsSyncedAt(): string {
  try {
    const manifest = asRecord(JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ MANIFEST, 'utf-8')));
    return toDay(manifest.syncedAt);
  } catch {
    return '';
  }
}
