import { cx } from '../../lib/cx';

/**
 * 页面容器：只管宽度与左右留白。
 *
 * 上下留白交给 .app-main（跟随 --nav-h / --player-h），所以这里刻意不碰
 * pt-* —— 以前每个页面都写一遍 `p-6 pt-8`，全站复制了 11 份。
 *
 * width:
 *   page   = 56rem（正文与导航共用，两者左右终于对齐）
 *   narrow = 44rem（404 / 维护页这类居中提示）
 */
export default function Container({
  width = 'page',
  className,
  children,
}: {
  width?: 'page' | 'narrow';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'mx-auto w-full px-page-x md:px-8',
        width === 'narrow' ? 'max-w-narrow' : 'max-w-page',
        className,
      )}
    >
      {children}
    </div>
  );
}
