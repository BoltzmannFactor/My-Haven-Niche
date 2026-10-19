'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { collectionLabel, formatDate } from '../lib/format';

export interface ArchiveItem {
  id: string;
  title: string;
  summary: string;
  collection: 'shuoshuo' | 'essays' | 'projects';
  date: string;
  tags: string[];
  href: string;
  searchText: string;
}

/**
 * 归档浏览器：数据源在服务端一次性算好（保持静态渲染），
 * 搜索与标签筛选都在客户端做，不需要再发请求。
 */
export default function ArchiveBrowser({ items }: { items: ArchiveItem[] }) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counter = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags) counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
    return [...counter.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (activeTag && !item.tags.includes(activeTag)) return false;
      if (!q) return true;
      return `${item.title} ${item.summary} ${item.searchText}`.toLowerCase().includes(q);
    });
  }, [items, query, activeTag]);

  const grouped = useMemo(() => {
    const map = new Map<string, ArchiveItem[]>();
    for (const item of filtered) {
      const year = String(new Date(item.date).getFullYear());
      const bucket = map.get(year) ?? [];
      bucket.push(item);
      map.set(year, bucket);
    }
    return [...map.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  return (
    <div>
      <div className="surface-card rounded-2xl p-5 mb-8">
        <label htmlFor="archive-search" className="sr-only">
          搜索归档内容
        </label>
        <input
          id="archive-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索标题、摘要或正文…"
          className="surface-input w-full rounded-xl px-4 py-2.5 text-sm font-light focus:outline-none focus:border-[var(--accent)] transition-colors"
        />

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              aria-pressed={activeTag === null}
              className={`px-3 py-1 rounded-full text-xs font-light border transition-colors ${
                activeTag === null
                  ? 'border-[var(--accent)] text-[var(--text-primary)] bg-[var(--accent-soft)]'
                  : 'border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--nav-hover-bg)]'
              }`}
            >
              全部 ({items.length})
            </button>
            {tags.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                aria-pressed={tag === activeTag}
                className={`px-3 py-1 rounded-full text-xs font-light border transition-colors ${
                  tag === activeTag
                    ? 'border-[var(--accent)] text-[var(--text-primary)] bg-[var(--accent-soft)]'
                    : 'border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--nav-hover-bg)]'
                }`}
              >
                #{tag} ({count})
              </button>
            ))}
          </div>
        )}
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm font-light text-[var(--text-secondary)]">
          没有匹配的内容，换个关键词试试。
        </p>
      ) : (
        <div className="space-y-10">
          {grouped.map(([year, list]) => (
            <section key={year}>
              <h2 className="text-sm font-light tracking-[0.2em] text-[var(--text-faint)] mb-3">
                {year}
              </h2>
              <ul className="space-y-2">
                {list.map((item) => (
                  <li key={`${item.collection}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 px-3 rounded-xl hover:bg-[var(--nav-hover-bg)] transition-colors"
                    >
                      <time
                        dateTime={item.date}
                        className="text-xs text-[var(--text-faint)] tabular-nums w-24 shrink-0"
                      >
                        {formatDate(item.date)}
                      </time>
                      <span className="text-sm font-light text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {item.title}
                      </span>
                      <span className="text-xs text-[var(--text-faint)]">
                        {collectionLabel(item.collection)}
                      </span>
                      {item.tags.length > 0 && (
                        <span className="text-xs text-[var(--text-faint)]">
                          {item.tags.map((t) => `#${t}`).join(' ')}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
