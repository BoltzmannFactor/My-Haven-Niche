import { cx } from '../../lib/cx';

/**
 * 页面标题区：H1 + 导语 + 右侧元信息 / 操作插槽。
 * 以前这段（H1 + 副标题 + mb-8）在 8 个页面里各手写一遍。
 */
export default function PageHeader({
  icon,
  title,
  lead,
  meta,
  actions,
  className,
}: {
  /** Unicode 符号前缀，保持现有气质 */
  icon?: string;
  title: string;
  lead?: string;
  /** 右侧元信息，如「共 12 条」 */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cx(
        'mb-stack-lg flex flex-wrap items-end justify-between gap-x-6 gap-y-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-display font-light tracking-[0.12em] text-ink">
          {icon && (
            <span className="mr-2 text-accent" aria-hidden="true">
              {icon}
            </span>
          )}
          {title}
        </h1>
        {lead && (
          <p className="mt-2 max-w-[42rem] text-lead font-light text-ink-soft">
            {lead}
          </p>
        )}
      </div>
      {(meta || actions) && (
        <div className="flex shrink-0 items-center gap-3 text-meta text-ink-faint">
          {meta}
          {actions}
        </div>
      )}
    </header>
  );
}
