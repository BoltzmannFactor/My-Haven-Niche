'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { name: '首页', path: '/', icon: '☁️' },
  { name: '说说', path: '/shuoshuo', icon: '💭' },
  { name: '杂谈', path: '/essays', icon: '✏️' },
  { name: '项目', path: '/projects', icon: '🛠️' },
  { name: '音乐', path: '/music', icon: '🎵' },
  { name: '归档', path: '/archives', icon: '📦' },
  { name: '照片墙', path: '/photos', icon: '📷' },
  { name: '灵境', path: '/realm', icon: '💡' },
  { name: '友链', path: '/links', icon: '🏡' },
  { name: '关于', path: '/about', icon: '🧭' },
];

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // 悬浮胶囊不再换行，但它的「顶部偏移 + 自身高度」共同决定从哪里开始才是正文。
  // 这里把导航底边到视口顶部的距离写进 --nav-h，main 用 padding-top 跟随。
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const publish = () => {
      const rect = el.getBoundingClientRect();
      document.documentElement.style.setProperty(
        '--nav-h',
        `${Math.ceil(rect.bottom)}px`
      );
    };

    publish();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', publish);
      return () => window.removeEventListener('resize', publish);
    }

    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="主导航"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[min(56rem,calc(100%-1.5rem))] rounded-full border-2 border-[var(--card-border-strong)] bg-[var(--nav-bg)] shadow-[0_5px_0_var(--pop-shadow)] backdrop-blur-xl transition-colors duration-500"
    >
      <div className="h-14 px-3 sm:px-4 flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="flex-none flex items-center gap-2 group"
          aria-label="返回首页"
        >
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-full bg-[var(--pop-3)] border-2 border-[var(--card-border-strong)] inline-flex items-center justify-center text-base transition-transform duration-200 ease-[var(--ease-bounce)] group-hover:-rotate-12 group-hover:scale-110"
          >
            ☁️
          </span>
          <span className="font-extrabold tracking-wide text-[var(--text-primary)] hidden sm:inline">
            风与日记
          </span>
          <span className="hidden md:inline text-[10px] font-bold tracking-[0.14em] text-[var(--text-faint)] uppercase">
            Windlog
          </span>
        </Link>

        {/* 小屏横向滚动，不折叠 —— 胶囊导航的高度因此恒定，--nav-h 更稳 */}
        <div className="flex-1 flex items-center gap-0.5 overflow-x-auto no-scrollbar justify-end">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={true}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-none px-2.5 py-1 rounded-full text-[13px] font-bold border-2 flex items-center gap-1 transition-all duration-150 ease-[var(--ease-soft)] ${
                  isActive
                    ? 'bg-[var(--nav-active-bg)] border-[var(--card-border-strong)] text-[var(--nav-text-active)]'
                    : 'border-transparent text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] hover:bg-[var(--nav-hover-bg)] hover:-rotate-2 hover:-translate-y-0.5'
                }`}
              >
                <span className="text-xs" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}
