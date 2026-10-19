import type { Metadata } from 'next';
import ArchiveBrowser, { type ArchiveItem } from '../components/ArchiveBrowser';
import { getAllContent } from '../lib/content';

export const metadata: Metadata = {
  title: '归档',
  description: '所有说说、杂谈与项目，按时间整理，可按标签筛选和关键词搜索。',
};

export default function ArchivesPage() {
  const items: ArchiveItem[] = getAllContent().map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    collection: item.collection,
    date: item.date,
    tags: item.tags,
    href: item.href,
    // 正文也参与搜索，但截断避免把一个很长的文件整体塞进客户端 payload
    searchText: item.content.slice(0, 2000),
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ◌ 归档
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        所有内容按时间整理，共 {items.length} 条。
      </p>

      <ArchiveBrowser items={items} />
    </div>
  );
}
