import Link from 'next/link';
import Reveal from './components/Reveal';
import Markdown from './components/Markdown';
import { getAllContent, getAllTags, getCollection, type ContentItem } from './lib/content';
import { getPlaylists } from './lib/music';
import { collectionLabel, formatShortDate } from './lib/format';

/**
 * 首页 —— 清新卡通版。
 * 服务端组件：数据在构建时从 content/*.md 读出，
 * 交互（主题切换 / 播放器 / 进场动画）各自是独立的客户端组件。
 */

const KIND_ICON: Record<ContentItem['collection'], string> = {
  shuoshuo: '💭',
  essays: '✏️',
  projects: '🛠️',
};

const ENTRY_GROUPS: {
  label: string;
  en: string;
  tint: string;
  entries: { icon: string; title: string; desc: string; href: string }[];
}[] = [
  {
    label: '写',
    en: 'Writing',
    tint: 'var(--tint-1)',
    entries: [
      { icon: '💭', title: '说说', desc: '不成篇的碎念，随写随发', href: '/shuoshuo' },
      { icon: '✏️', title: '杂谈', desc: '勉强成篇的长一点的话', href: '/essays' },
      { icon: '📦', title: '归档', desc: '全部内容按年月与标签排列', href: '/archives' },
    ],
  },
  {
    label: '做',
    en: 'Making',
    tint: 'var(--tint-2)',
    entries: [
      { icon: '🛠️', title: '项目', desc: '做了一半和做完的东西', href: '/projects' },
      { icon: '💡', title: '灵境', desc: '还没想清楚的构想盒子', href: '/realm' },
    ],
  },
  {
    label: '听看',
    en: 'Senses',
    tint: 'var(--tint-5)',
    entries: [
      { icon: '🎵', title: '音乐', desc: '常驻播放条的歌单', href: '/music' },
      { icon: '📷', title: '照片墙', desc: '快门按下的那些瞬间', href: '/photos' },
    ],
  },
];

function excerptOf(item: ContentItem): string {
  if (item.summary) return item.summary;
  // 去掉简单的 Markdown 记号后取前 60 字，只做预览不做渲染
  return item.content.replace(/[#>*`[\]()!]/g, '').trim().slice(0, 60);
}

export default function Home() {
  const shuoshuo = getCollection('shuoshuo');
  const essays = getCollection('essays');
  const projects = getCollection('projects');
  const trackCount = getPlaylists().reduce((sum, p) => sum + p.tracks.length, 0);
  const latest = getAllContent().slice(0, 4);
  const tags = getAllTags().slice(0, 8);

  // 归档热力：当前年份每月的内容数（构建时计算）
  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, () => 0);
  for (const item of getAllContent()) {
    const d = new Date(item.date);
    if (d.getFullYear() === year) {
      months[d.getMonth()] += 1;
    }
  }
  const monthMax = Math.max(...months, 1);
  const totalThisYear = months.reduce((a, b) => a + b, 0);

  const stats = [
    { icon: '💬', num: shuoshuo.length, label: '说说' },
    { icon: '✏️', num: essays.length, label: '杂谈' },
    { icon: '🛠️', num: projects.length, label: '项目' },
    { icon: '🎵', num: trackCount, label: '曲目' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 flex flex-col gap-12">
      {/* ============ Hero：气泡对话框 + 云朵吉祥物 ============ */}
      <section className="relative mt-2">
        <div className="relative rounded-[2rem] border-2 border-[var(--card-border-strong)] bg-[var(--card-bg)] shadow-[0_8px_0_var(--pop-shadow)] p-8 sm:p-12">
          {/* 对话气泡小尾巴 */}
          <span
            aria-hidden="true"
            className="absolute left-12 -bottom-[15px] w-6 h-6 bg-[var(--card-bg)] border-r-2 border-b-2 border-[var(--card-border-strong)] rounded-br-md rotate-45"
          />

          {/* 云朵吉祥物 */}
          <svg viewBox="0 0 120 84" fill="none" aria-hidden="true" className="floaty absolute -top-9 right-4 sm:right-10 w-24 sm:w-28 drop-shadow-[0_4px_0_var(--pop-shadow)]">
            <path d="M28 66c-12 0-22-9-22-20 0-10 8-18 18-19C27 15 39 6 53 6c14 0 26 9 30 22 2-1 5-2 8-2 11 0 20 9 20 20s-9 20-20 20H28z" fill="var(--card-bg)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="47" cy="38" r="2.8" fill="var(--ink)" />
            <circle cx="69" cy="38" r="2.8" fill="var(--ink)" />
            <path d="M50 47q8 7 16 0" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="40" cy="46" r="4" fill="#FFB3A0" opacity="0.85" />
            <circle cx="76" cy="46" r="4" fill="#FFB3A0" opacity="0.85" />
          </svg>

          <p className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border-2 border-[var(--card-border-strong)] bg-[var(--tint-2)] text-[11px] font-extrabold tracking-[0.1em] uppercase text-[var(--text-secondary)] mb-4">
            ☁️ A happy little corner
          </p>

          <h1 className="text-[clamp(2.1rem,1.1rem+5vw,3.1rem)] leading-[1.25] font-extrabold text-[var(--text-primary)]">
            风穿过的地方，
            <br />
            都留下了<span className="hl">一页日记</span>。
          </h1>

          <p className="mt-4 max-w-[30em] text-[var(--text-lead)] leading-[1.8] text-[var(--text-secondary)]">
            这里收留着一些不急着说完整的话——说说、杂谈、做了一半的项目，和循环播放的钢琴曲。
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#latest" className="btn-pop btn-pop-primary">
              读读最近的 →
            </Link>
            <Link href="/archives" className="btn-pop btn-pop-mint">
              逛逛归档
            </Link>
            <Link href="/music" className="btn-pop btn-pop-ghost">
              🎵 打开歌单
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 统计条 ============ */}
      <Reveal>
        <section aria-label="站点统计" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center py-4 px-2 rounded-[1.375rem] border-2 border-[var(--card-border-strong)] shadow-[0_5px_0_var(--pop-shadow)] transition-transform duration-200 ease-[var(--ease-bounce)] hover:-translate-y-1 hover:rotate-1"
              style={{ background: `var(--tint-${(stats.indexOf(s) % 5) + 1})` }}
            >
              <div className="text-xl leading-relaxed" aria-hidden="true">{s.icon}</div>
              <div className="text-2xl font-extrabold tabular-nums text-[var(--text-primary)]">{s.num}</div>
              <div className="text-[11px] font-bold tracking-[0.1em] text-[var(--text-faint)]">{s.label}</div>
            </div>
          ))}
        </section>
      </Reveal>

      {/* ============ 今日一句：漫画气泡 ============ */}
      <Reveal>
        <section className="relative rounded-[2rem] border-2 border-[var(--card-border-strong)] bg-[var(--tint-3)] shadow-[0_8px_0_var(--pop-shadow)] p-8 sm:p-10">
          <span
            aria-hidden="true"
            className="absolute right-14 -top-[15px] w-5 h-5 bg-[var(--tint-3)] border-l-2 border-t-2 border-[var(--card-border-strong)] rotate-45"
          />
          <blockquote className="text-xl sm:text-2xl font-extrabold leading-[1.7] text-[var(--text-primary)]">
            写字的人不追风，
            <br />
            只是把<span className="bg-[var(--card-bg)] px-1 rounded">风路过时的声音</span>记下来。
          </blockquote>
          <p className="mt-3 text-[13px] font-bold text-[var(--text-faint)]">
            —— 写在十月末，桂花落尽的时候
          </p>
        </section>
      </Reveal>

      {/* ============ 分组入口 ============ */}
      <section>
        <SectionHead dot="var(--pop-1)" title="入口" en="Entries" />
        <div className="flex flex-col gap-6">
          {ENTRY_GROUPS.map((group) => (
            <div key={group.label} className="grid grid-cols-1 sm:grid-cols-[6.2rem_1fr] gap-3">
              <div
                className="flex flex-col items-center justify-center gap-0.5 rounded-[1.375rem] border-2 border-[var(--card-border-strong)] shadow-[0_5px_0_var(--pop-shadow)] -rotate-1"
                style={{ background: group.tint }}
              >
                <b className="text-xl font-extrabold text-[var(--text-primary)]">{group.label}</b>
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-faint)]">
                  {group.en}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.entries.map((entry) => (
                  <Link
                    key={entry.href + entry.title}
                    href={entry.href}
                    className="card-pop card-pop-hover relative flex flex-col gap-1 p-5 group"
                  >
                    <span
                      aria-hidden="true"
                      className="w-9 h-9 rounded-xl border-2 border-[var(--card-border-strong)] inline-flex items-center justify-center text-lg mb-1 -rotate-3 group-hover:rotate-6 transition-transform duration-200 ease-[var(--ease-bounce)]"
                      style={{ background: group.tint }}
                    >
                      {entry.icon}
                    </span>
                    <b className="text-[15px] font-bold text-[var(--text-primary)]">{entry.title}</b>
                    <span className="text-[13px] leading-snug text-[var(--text-faint)]">{entry.desc}</span>
                    <span
                      aria-hidden="true"
                      className="absolute right-4 top-4 font-extrabold text-[var(--pop-1)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:-rotate-45 transition-all duration-200 ease-[var(--ease-bounce)]"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 一年里的风声：归档热力 ============ */}
      <section>
        <SectionHead dot="var(--pop-4)" title="一年里的风声" en="Archive Pulse" more={{ href: '/archives', text: '进归档 →' }} />
        <Reveal>
          <div className="card-pop p-6">
            <p className="flex items-baseline gap-2 text-[13px] font-bold text-[var(--text-faint)] mb-4">
              <b className="text-[15px] font-extrabold text-[var(--text-primary)]">{year}</b>
              <span>每月留存 · 共 {totalThisYear} 篇</span>
            </p>
            <div className="flex items-end gap-2 h-16" role="img" aria-label={`${year} 年每月内容数量`}>
              {months.map((count, idx) => (
                <i
                  key={idx}
                  className="flex-1 min-h-2 rounded-lg border-2 border-[var(--card-border-strong)] origin-bottom transition-transform duration-200 ease-[var(--ease-bounce)] hover:scale-y-105"
                  style={{
                    height: `${Math.max((count / monthMax) * 100, count > 0 ? 14 : 8)}%`,
                    background: `var(--pop-${(idx % 4) + 2})`,
                  }}
                  title={`${idx + 1} 月 · ${count} 篇`}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-2" aria-hidden="true">
              {months.map((_, idx) => (
                <span key={idx} className="flex-1 text-center text-[10px] font-bold text-[var(--text-faint)]">
                  {['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][idx]}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ 最近的风：时间线 ============ */}
      <section id="latest">
        <SectionHead dot="var(--pop-2)" title="最近的风" en="Latest" more={{ href: '/archives', text: '全部 →' }} />
        <div className="relative flex flex-col gap-3 pl-7">
          {/* 虚线时间轴 */}
          <span aria-hidden="true" className="absolute left-2 top-3 bottom-3 border-l-[3px] border-dashed border-[var(--divider)]" />
          {latest.length === 0 ? (
            <p className="card-pop p-6 text-sm text-[var(--text-secondary)]">
              还没有写下第一条。去
              <Link href="/shuoshuo" className="mx-1 font-bold text-[var(--accent-link)] underline underline-offset-4">
                说说页
              </Link>
              写下此刻吧。
            </p>
          ) : (
            latest.map((item, idx) => (
              <Reveal key={item.collection + item.id}>
                <article className="card-pop card-pop-hover relative p-5 sm:px-6 hover:translate-x-1">
                  {/* 彩色时间点 */}
                  <span
                    aria-hidden="true"
                    className="absolute -left-[26px] top-6 w-3 h-3 rounded-full border-2 border-[var(--card-border-strong)]"
                    style={{ background: `var(--pop-${(idx % 4) + 1})` }}
                  />
                  {idx === 0 && (
                    <span
                      aria-hidden="true"
                      className="wiggle absolute -top-3 -right-2 w-12 h-12 bg-[var(--pop-3)] border-2 border-[var(--card-border-strong)] flex items-center justify-center text-[10px] font-extrabold tracking-wide text-[#454B66]"
                      style={{
                        clipPath:
                          'polygon(50% 0%, 61% 12%, 77% 7%, 79% 24%, 95% 28%, 88% 43%, 100% 50%, 88% 57%, 95% 72%, 79% 76%, 77% 93%, 61% 88%, 50% 100%, 39% 88%, 23% 93%, 21% 76%, 5% 72%, 12% 57%, 0% 50%, 12% 43%, 5% 28%, 21% 24%, 23% 7%, 39% 12%)',
                      }}
                    >
                      NEW
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[var(--text-faint)] tabular-nums">
                    <span
                      className="px-2.5 py-0.5 rounded-full border-2 border-[var(--card-border-strong)] text-[var(--text-primary)]"
                      style={{ background: `var(--tint-${(idx % 5) + 1})` }}
                    >
                      {KIND_ICON[item.collection]} {collectionLabel(item.collection)}
                    </span>
                    <time dateTime={item.date}>{formatShortDate(item.date)}</time>
                  </div>
                  <h3 className="mt-1.5 text-[15px] font-bold text-[var(--text-primary)]">
                    <Link href={item.href}>{item.title}</Link>
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)] line-clamp-2">
                    {excerptOf(item)}
                  </p>
                  {item.collection === 'shuoshuo' && !item.summary && (
                    <div className="mt-2 markdown-body text-sm">
                      <Markdown>{item.content}</Markdown>
                    </div>
                  )}
                </article>
              </Reveal>
            ))
          )}
        </div>
      </section>

      {/* ============ 标签云 ============ */}
      <section>
        <SectionHead dot="var(--pop-5)" title="常写的关键词" en="Tags" more={{ href: '/archives', text: '归档 →' }} />
        <Reveal>
          <div className="flex flex-wrap gap-2.5">
            {tags.length === 0 ? (
              <p className="text-sm text-[var(--text-faint)]">还没有标签。</p>
            ) : (
              tags.map(({ tag, count }) => (
                <Link key={tag} href={`/archives?tag=${encodeURIComponent(tag)}`} className="chip-pop">
                  {tag} <i className="not-italic text-[10px] text-[var(--text-faint)] tabular-nums">{count}</i>
                </Link>
              ))
            )}
          </div>
        </Reveal>
      </section>

      {/* ============ 友链 ============ */}
      <section>
        <SectionHead dot="var(--pop-1)" title="邻居们的院子" en="Friends" more={{ href: '/links', text: '申请友链 →' }} />
        <Reveal>
          <div className="card-pop p-6 text-sm text-[var(--text-secondary)]">
            🏡 院子还没修好栅栏，先去
            <Link href="/links" className="mx-1 font-bold text-[var(--accent-link)] underline underline-offset-4">
              友链页
            </Link>
            看看邻居们吧。
          </div>
        </Reveal>
      </section>

      {/* ============ 页脚：山丘剪影 ============ */}
      <footer>
        <div aria-hidden="true" className="mt-4 pointer-events-none">
          <svg viewBox="0 0 900 110" preserveAspectRatio="none" className="block w-full h-auto">
            <path d="M0 70 Q120 20 260 55 T560 50 T900 60 V110 H0 Z" fill="var(--hill-2)" />
            <path d="M0 92 Q180 48 380 78 T900 82 V110 H0 Z" fill="var(--hill-1)" />
            <g stroke="var(--ink)" strokeWidth="2">
              <path d="M150 66v10" />
              <path d="M150 60l-7 12h14z" fill="var(--hill-2)" />
              <path d="M640 64v10" />
              <path d="M640 58l-7 12h14z" fill="var(--hill-2)" />
            </g>
          </svg>
        </div>
        <div className="border-t-2 border-[var(--card-border-strong)] bg-[var(--hill-1)] -mt-px px-6 py-8 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
          <div>
            <p className="text-xl font-extrabold text-[var(--text-primary)]">☀️ 风不停，字不停。</p>
            <p className="mt-2 text-[13px] font-semibold leading-[1.9] text-[var(--text-secondary)]">
              © {year} 风与日记 · Windlog
              <br />
              写于 <code className="font-mono text-[0.9em] bg-[var(--card-bg)] border-[1.5px] border-[var(--card-border-strong)] rounded-md px-1.5 py-0.5">Obsidian</code>，风吹到 GitHub，再落成这里的一页。
            </p>
          </div>
          <div className="flex sm:flex-col items-start sm:items-end gap-2 text-[13px] font-bold">
            <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:-translate-x-1 hover:-rotate-2 inline-block transition-transform duration-200 ease-[var(--ease-bounce)]">
              关于我
            </Link>
            <Link href="/links" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:-translate-x-1 hover:-rotate-2 inline-block transition-transform duration-200 ease-[var(--ease-bounce)]">
              友链
            </Link>
            <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:-translate-x-1 hover:-rotate-2 inline-block transition-transform duration-200 ease-[var(--ease-bounce)]">
              回到顶部 ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({
  dot,
  title,
  en,
  more,
}: {
  dot: string;
  title: string;
  en: string;
  more?: { href: string; text: string };
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span aria-hidden="true" className="w-3.5 h-3.5 rounded-full border-2 border-[var(--card-border-strong)] flex-none" style={{ background: dot }} />
      <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{title}</h2>
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--text-faint)]">{en}</span>
      {more && (
        <Link href={more.href} className="ml-auto text-[13px] font-bold text-[var(--pop-1)] hover:translate-x-1 hover:-rotate-2 inline-block transition-transform duration-200 ease-[var(--ease-bounce)]">
          {more.text}
        </Link>
      )}
    </div>
  );
}
