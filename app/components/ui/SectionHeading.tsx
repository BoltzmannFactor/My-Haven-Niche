import { cx } from '../../lib/cx';

/** 二级区块标题 + 右侧动作（如「全部 →」） */
export default function SectionHeading({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'mb-stack flex flex-wrap items-baseline justify-between gap-2',
        className,
      )}
    >
      <h2 className="text-title-sm font-medium tracking-[0.06em] text-ink">
        {title}
      </h2>
      {action}
    </div>
  );
}
