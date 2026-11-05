import { cx } from '../../lib/cx';

/**
 * 卡片。刻意不做多态 `as` prop —— <Card> 永远渲染 <div>。
 * 列表项请用 <li> 包 <Card>（<li> 承载 id / scroll-mt），
 * 这样彻底避开 TS strict 下 React.ElementType + rest props 的类型体操。
 *
 * tone:
 *   plain  普通卡片（毛玻璃 + 轻阴影）
 *   raised Hero / 大面板（更明显的阴影）
 *   ghost  只要结构不要底色（用于 EmptyState 之类）
 */
export default function Card({
  tone = 'plain',
  interactive = false,
  padded = true,
  className,
  children,
  ...rest
}: {
  tone?: 'plain' | 'raised' | 'ghost';
  interactive?: boolean;
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'rounded-card border border-line',
        tone === 'ghost'
          ? 'bg-transparent'
          : 'bg-surface backdrop-blur-[var(--blur-surface)]',
        padded && 'p-card',
        tone === 'ghost'
          ? ''
          : tone === 'raised'
            ? 'shadow-card'
            : 'shadow-soft',
        interactive && 't-ui hover:bg-surface-hover hover:shadow-lift',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
