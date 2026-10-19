import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * 歌单加载器：content/music/*.md
 *
 * 刻意与 content.ts 的文章管线分开 —— 歌单是「曲目列表」而不是文章，
 * 并进 Collection 类型会让归档页和标签云混进歌单条目。
 * 同理，这些函数只在服务端执行，客户端组件不要引用本模块的值（类型除外）。
 */

export interface Track {
  title: string;
  artist: string;
  /** 网易云歌曲 id。空字符串表示还没绑定，该条目不可播放 */
  netease: string;
  mood: string;
}

export interface Playlist {
  /** 文件名去掉 .md */
  id: string;
  title: string;
  summary: string;
  /** ISO 8601 */
  date: string;
  tags: string[];
  /** 正文，Markdown */
  body: string;
  tracks: Track[];
}

// 与 content.ts 同理：显式关掉 Turbopack 对「可能读取任意文件」的追踪。
// content/ 目录的打包由 next.config.ts 的 outputFileTracingIncludes 负责。
const MUSIC_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), 'content', 'music');

function toText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
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
    return value.map(toText).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function toTracks(value: unknown): Track[] {
  if (!Array.isArray(value)) return [];

  const tracks = value.map((raw): Track => {
    const item = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
    return {
      title: toText(item.title),
      artist: toText(item.artist),
      netease: toText(item.netease),
      mood: toText(item.mood),
    };
  });

  // 没有曲名的条目没有意义，直接丢掉
  return tracks.filter((track) => track.title);
}

export function getPlaylists(): Playlist[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ MUSIC_DIR)) return [];

  return fs
    .readdirSync(/*turbopackIgnore: true*/ MUSIC_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ path.join(MUSIC_DIR, file), 'utf-8');
      const { data, content } = matter(raw);
      const id = file.replace(/\.md$/, '');

      return {
        id,
        title: toText(data.title) || id,
        summary: toText(data.summary),
        date: toDate(data.date),
        tags: toTags(data.tags),
        body: content.trim(),
        tracks: toTracks(data.tracks),
      };
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/** 歌单里真正能播的曲目数（没绑 id 的不算） */
export function countPlayable(playlist: Playlist): number {
  return playlist.tracks.filter((track) => track.netease).length;
}
