'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  { name: '首页', path: '/', icon: '✦' },
  { name: '项目', path: '/projects', icon: '◈' },
  { name: '归档', path: '/archives', icon: '◌' },
  { name: '照片墙', path: '/photos', icon: '✧' },
  { name: '音乐', path: '/music', icon: '♪' },
  { name: '灵境', path: '/realm', icon: '∞' },
  { name: '说说', path: '/shuoshuo', icon: '·' },
  { name: '杂谈', path: '/essays', icon: '◍' },
  { name: '友链', path: '/links', icon: '✧' },
  { name: '关于', path: '/about', icon: '◇' },
];

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // 十导航项在不同宽度下会换行，固定 pt-16 必然遮住内容。
  // 这里把真实高度写进 --nav-h，main 用 padding-top 跟随。
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const publish = () => {
      document.documentElement.style.setProperty(
        '--nav-h',
        `${Math.ceil(el.getBoundingClientRect().height)}px`
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

  // 路由变化后收起移动端菜单：在点击事件里处理，而不是在 effect 里 setState
  const closeMenu = () => setOpen(false);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 bg-[var(--nav-bg)] backdrop-blur-2xl border-b border-[var(--nav-border)] transition-colors duration-500"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between lg:justify-center">
          <Link
            href="/"
            onClick={closeMenu}
            className="text-2xl font-light tracking-[0.3em] text-[var(--nav-text)] lg:mb-1.5 transition-colors duration-500"
          >
            ✦ Windlog ✦
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? '收起导航菜单' : '展开导航菜单'}
            className="lg:hidden px-3 py-1.5 rounded-full text-sm text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] hover:bg-[var(--nav-hover-bg)] transition-colors"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        <div
          id="nav-menu"
          className={`${
            open ? 'flex' : 'hidden'
          } lg:flex flex-wrap justify-center gap-0.5 mt-2 lg:mt-0`}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={true}
                onClick={closeMenu}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-light transition-all duration-300
                  flex items-center gap-1
                  ${
                    isActive
                      ? 'text-[var(--nav-text-active)] bg-[var(--nav-active-bg)]'
                      : 'text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] hover:bg-[var(--nav-hover-bg)]'
                  }
                `}
              >
                <span className="text-xs opacity-60" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
