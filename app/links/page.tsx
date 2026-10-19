import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '友链',
  description: '在森林里互相留一盏灯的朋友们。',
};

type LinkItem = {
  name: string;
  url: string;
  desc: string;
  avatar?: string;
};

// 在这里添加你的友链，格式如下：
// { name: '站点名', url: 'https://example.com', desc: '一句话介绍', avatar: '首字' }
const links: LinkItem[] = [];

export default function LinksPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ✧ 友链
      </h1>
      <p className="text-[var(--text-secondary)] font-light mb-8">
        在森林里互相留一盏灯的朋友们。
      </p>

      {links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((item) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 surface-card rounded-2xl p-5 hover:bg-[var(--card-bg-hover)] transition-all duration-300"
            >
              <span className="shrink-0 w-11 h-11 rounded-full bg-[var(--accent)]/25 flex items-center justify-center text-[var(--text-primary)] font-light">
                {item.avatar || item.name.slice(0, 1)}
              </span>
              <span className="min-w-0">
                <span className="block text-[var(--text-primary)] font-light group-hover:underline">
                  {item.name}
                </span>
                <span className="block text-sm text-[var(--text-secondary)] font-light mt-1">
                  {item.desc}
                </span>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="surface-card rounded-2xl p-6">
          <p className="text-[var(--text-primary)] font-light">
            还没有挂上任何友链。
          </p>
          <p className="text-[var(--text-secondary)] font-light text-sm mt-3 leading-relaxed">
            编辑 <code className="px-1.5 py-0.5 rounded bg-[var(--code-bg)]">app/links/page.tsx</code> 里的{' '}
            <code className="px-1.5 py-0.5 rounded bg-[var(--code-bg)]">links</code> 数组即可添加，格式：
          </p>
          <pre className="mt-3 text-xs text-[var(--text-secondary)] font-light overflow-x-auto leading-relaxed">
{`{ name: '站点名', url: 'https://example.com', desc: '一句话介绍' }`}
          </pre>
        </div>
      )}
    </div>
  );
}
