import type { Metadata } from 'next';
import Markdown from '../components/Markdown';
import { getCollection } from '../lib/content';
import { formatShortDate } from '../lib/format';

export const metadata: Metadata = {
  title: '说说',
  description: '碎片化的想法和日常 —— 写在 Obsidian 里，随仓库同步到这片林子。',
};

/**
 * 纯静态页面：内容全部来自 content/shuoshuo/*.md，也就是 Obsidian vault 里的那份文件。
 * 要新增一条，直接在 Obsidian 里新建 Markdown，Git 插件推上去后本站自动重建。
 */
export default function ShuoshuoPage() {
  const posts = getCollection('shuoshuo');

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ⑅⃟◌ 说说
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        碎片化的想法和日常 —— 内容就是 Obsidian 里 content/shuoshuo/ 下的 Markdown 文件。
      </p>

      <section>
        <h2 className="text-lg font-light tracking-[0.15em] text-[var(--text-primary)] mb-4">
          全部 · {posts.length}
        </h2>

        {posts.length === 0 ? (
          <p className="text-sm font-light text-[var(--text-secondary)]">
            还没有内容。在 Obsidian 里往 content/shuoshuo/ 新建一个 Markdown 文件试试。
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li
                key={post.id}
                id={post.id}
                className="surface-card rounded-2xl p-5 scroll-mt-24"
              >
                <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-[var(--text-faint)]">
                  <time dateTime={post.date} className="tabular-nums">
                    {formatShortDate(post.date)}
                  </time>
                  {post.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
                <Markdown>{post.content}</Markdown>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
