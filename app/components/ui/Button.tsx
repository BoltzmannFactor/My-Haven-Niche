import Link from 'next/link';
import { cx } from '../../lib/cx';

type Variant = 'primary' | 'outline' | 'quiet';
type Size = 'sm' | 'md';

/**
 * 按钮 / 按钮式链接。
 *
 * 有 href → next/link（内部）或 <a target=_blank>（external）；
 * 无 href → <button type="button">。
 *
 * ⚠️ rest props 必须 Omit 掉 'type'：<a> 的 type 是 MIME hint，
 * <button> 的 type 是提交类型，两者交叉后会变成 never，整个 props 直接废掉。
 */
export default function Button({
  href,
  external = false,
  variant = 'outline',
  size = 'md',
  className,
  children,
  ...rest
}: {
  href?: string;
  external?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'className' | 'children'
>) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-chip border font-medium t-color',
    size === 'sm' ? 'px-3.5 py-1.5 text-meta' : 'px-5 py-2.5 text-body',
    variant === 'primary' &&
      'border-accent bg-accent-soft text-ink hover:shadow-card',
    variant === 'outline' &&
      'border-line bg-surface text-ink hover:bg-surface-hover hover:border-line-strong',
    variant === 'quiet' &&
      'border-transparent text-ink-soft hover:text-ink hover:bg-surface',
    className,
  );

  if (href) {
    return external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {children}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
