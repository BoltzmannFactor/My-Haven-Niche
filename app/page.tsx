import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import Markdown from './components/Markdown';
import { getLatest } from './lib/content';
import { collectionLabel, formatShortDate } from './lib/format';

// 首页不再需要客户端状态：内容来自构建时的 Markdown，主题按钮单独是客户端组件。
// 这样首屏 HTML 就带着正文，SEO 和首屏速度都比原先「先渲染骨架再 fetch」更好。

const features = [
  { icon: '✎', title: '杂谈', desc: '写得长一点的思考', href: '/essays' },
  { icon: '·', title: '最近说说', desc: '', href: '/shuoshuo', dynamic: 'shuoshuo' },
  { icon: '♪', title: '音乐', desc: '森林里的钢琴曲', href: '/music' },
  { icon: '◈', title: '项目', desc: '用代码写诗', href: '/projects' },
  { icon: '✦', title: '照片墙', desc: '定格的光影', href: '/photos' },
  { icon: '◇', title: '关于', desc: 'Windseeker · 追风者', href: '/about' },
];

export default function Home() {
  const latest = getLatest('shuoshuo', 3);

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)]">
          ✦ 风与日记 ✦
        </h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((item) => (
          <FeatureCard
            key={item.href}
            icon={item.icon}
            title={item.title}
            description={
              item.dynamic === 'shuoshuo'
                ? `${latest.length} 条最近的碎片`
                : item.desc
            }
            href={item.href}
          />
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-light tracking-[0.15em] text-[var(--text-primary)]">
            {collectionLabel('shuoshuo')} · 最近
          </h2>
          <Link
            href="/shuoshuo"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            全部 →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="text-sm font-light text-[var(--text-secondary)] surface-card rounded-2xl p-6">
            还没有写下第一条。去
            <Link href="/shuoshuo" className="mx-1 text-[var(--accent)] underline underline-offset-4">
              说说页
            </Link>
            写下此刻吧。
          </p>
        ) : (
          <ul className="space-y-3">
            {latest.map((item) => (
              <li key={item.id} className="surface-card rounded-2xl p-5">
                <div className="flex items-baseline gap-3 mb-2">
                  <time
                    dateTime={item.date}
                    className="text-xs font-light text-[var(--text-faint)] tabular-nums"
                  >
                    {formatShortDate(item.date)}
                  </time>
                  <Link
                    href={item.href}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    查看 →
                  </Link>
                </div>
                <Markdown>{item.content}</Markdown>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="text-center text-[var(--text-faint)] text-xs tracking-widest mt-12">
        ✦ 月光下的手稿 ✦
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    // 用 Link 而不是 div + onClick：天然支持键盘 Tab 聚焦、回车打开、右键新标签和预取
    <Link
      href={href}
      className="group surface-card rounded-2xl p-6 shadow-sm hover:shadow-md hover:bg-[var(--card-bg-hover)] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
      <h3 className="text-lg font-light text-[var(--text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] font-light mt-1">{description}</p>
      <div className="mt-3 text-xs text-[var(--text-faint)] group-hover:text-[var(--text-secondary)] transition-colors">
        点击进入 ✦
      </div>
    </Link>
  );
}
