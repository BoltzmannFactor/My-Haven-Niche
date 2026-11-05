import Link from 'next/link';
import { cx } from '../../lib/cx';

/**
 * 标签 / pill。以前全站有 4 种互不兼容的写法
 * （TagList、项目状态徽章、归档筛选按钮、说说的裸 span），统一到这里。
 *
 * 有 href → <Link>；有 onClick → <button>；都没有 → <span>。
 * ⚠️ rest props 必须 Omit 掉 'type'，理由同 Button。
 */
export default function Chip({
  tone = 'default',
  active = false,
  href,
  count,
  className,
  children,
  ...rest
}: {
  tone?: 'default' | 'accent';
  active?: boolean;
  href?: string;
  count?: number;
  className?: string;
  children: React.ReactNode;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'className' | 'children'
>) {
  const cls = cx(
    'inline-flex items-center gap-1 rounded-chip border px-2.5 py-0.5 text-meta t-color',
    tone === 'accent'
      ? 'border-accent bg-accent-soft text-ink'
      : 'border-line bg-transparent text-ink-soft',
    active && 'border-accent bg-accent-soft text-ink',
    href && 'hover:border-line-strong hover:text-ink',
    className,
  );

  const inner = (
    <>
      {children}
      {count !== undefined && <span className="text-ink-faint">{count}</span>}
    </>
  );

  const { onClick, ...buttonRest } = rest;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cls}
        {...buttonRest}
      >
        {inner}
      </button>
    );
  }
  return <span className={cls}>{inner}</span>;
}
