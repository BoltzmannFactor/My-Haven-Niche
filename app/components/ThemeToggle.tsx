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
    () => DEFAULT_THEME // 服务端快照：首帧一律按白日主题渲染，客户端接管后校正
  );

  const isDay = theme === 'day';

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDay ? 'night' : 'day')}
      aria-label={isDay ? '切换到星空主题' : '切换到白日主题'}
      aria-pressed={!isDay}
      className="flex-none w-11 h-11 rounded-full border-2 border-[var(--card-border-strong)] bg-[var(--tint-4)] inline-flex items-center justify-center transition-transform duration-200 ease-[var(--ease-bounce)] hover:rotate-12 hover:scale-105"
    >
      {isDay ? (
        // 月亮：切去星空
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // 太阳：切回白日
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
