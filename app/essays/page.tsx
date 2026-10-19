import type { Metadata } from 'next';
import Markdown from '../components/Markdown';
import TagList from '../components/TagList';
import { getCollection } from '../lib/content';
import { collectionLabel, formatDate } from '../lib/format';

export const metadata: Metadata = {
  title: '杂谈',
  description: '随想随写，不拘一格 —— 关于建站、产品与日常的 longer-form 手稿。',
};

export default function EssaysPage() {
  const posts = getCollection('essays');

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ◍ 杂谈
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        随想随写，不拘一格。共 {posts.length} 篇。
      </p>

      {posts.length === 0 ? (
        <p className="text-sm font-light text-[var(--text-secondary)] surface-card rounded-2xl p-6">
          还没有文章。在 content/essays/ 下新建一个 .md 文件就会出现在这里。
        </p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.id} id={post.id} className="surface-card rounded-2xl p-6 scroll-mt-24">
              <article>
                <header className="mb-4">
                  <h2 className="text-xl font-light text-[var(--text-primary)] mb-2">
                    <a href={`#${post.id}`} className="hover:text-[var(--accent)] transition-colors">
                      {post.title}
                    </a>
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-faint)]">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>·</span>
                    <span>{collectionLabel(post.collection)}</span>
                    <TagList tags={post.tags} />
                  </div>
                  {post.summary && (
                    <p className="mt-3 text-sm font-light text-[var(--text-secondary)]">
                      {post.summary}
                    </p>
                  )}
                </header>

                {/* 正文在服务端渲染，列表页直接展示全文 */}
                <Markdown>{post.content}</Markdown>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
