'use client';

import { useSyncExternalStore } from 'react';
import {
  applyTheme,
  DEFAULT_THEME,
  readAppliedTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type Theme,
} from '../lib/theme';

// 用 useSyncExternalStore 订阅主题变化：
// 数据源是 <html data-theme>（由 layout 的内联脚本在首帧前设置），
// 属于「外部系统」，这样既不需要在 effect 里 setState，也不会有水合不一致。
function subscribe(onChange: () => void) {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) onChange();
  };
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', handleStorage);
  };
}

export default function ThemeToggle() {
  const theme: Theme = useSyncExternalStore(
    subscribe,
    readAppliedTheme,
    () => DEFAULT_THEME // 服务端快照：首帧一律按浅色主题渲染，客户端接管后校正
  );

  const isForest = theme === 'forest';

  return (
    <button
      type="button"
      onClick={() => applyTheme(isForest ? 'fantasy' : 'forest')}
      aria-label={isForest ? '切换到月光手稿主题' : '切换到森林钢琴主题'}
      aria-pressed={!isForest}
      className="surface-card px-4 py-2 rounded-full text-sm font-light text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover-bg)] transition-all duration-300"
    >
      {isForest ? '🌙 切换到月光手稿' : '🌿 切换到森林钢琴'}
    </button>
  );
}
