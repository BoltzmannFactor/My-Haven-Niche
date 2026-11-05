import Card from './Card';
import { cx } from '../../lib/cx';

/**
 * 空状态。以前 8 处各写各的（有的是裸 <p>，有的带卡片，有的带 <pre>），
 * 统一到这里。
 */
export default function EmptyState({
  icon = '◌',
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card tone="ghost" className={cx('py-10 text-center', className)}>
      <div className="text-title-sm text-ink-faint" aria-hidden="true">
        {icon}
      </div>
      <p className="mt-3 text-body text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-[32rem] text-caption leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center gap-3">{action}</div>}
    </Card>
  );
}
