// 主题相关常量与工具 —— 清新卡通版：白日（day）/ 星空（night）。
// 主题统一在 <html data-theme="day|night"> 上切换，颜色全部由 globals.css 提供。
export type Theme = 'day' | 'night';

export const THEME_STORAGE_KEY = 'windlog-theme';

/** 同页面内切换时，用自定义事件通知其它组件（storage 事件只在跨标签页触发） */
export const THEME_CHANGE_EVENT = 'windlog:theme-change';

export const DEFAULT_THEME: Theme = 'day';

/** 旧版主题名 → 新版映射：老读者的 localStorage 里可能还是 forest/fantasy */
const LEGACY_THEME_MAP: Record<string, Theme> = {
  forest: 'day',
  fantasy: 'night',
};

export function normalizeTheme(value: string | null): Theme | null {
  if (value === 'day' || value === 'night') return value;
  return LEGACY_THEME_MAP[value ?? ''] ?? null;
}

export function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** 读取当前生效的主题：<head> 里的内联脚本已经把值写到 <html> 上了 */
export function readAppliedTheme(): Theme {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  return normalizeTheme(document.documentElement.getAttribute('data-theme')) ?? DEFAULT_THEME;
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // 隐私模式下 localStorage 可能不可写，忽略即可，主题仍在本次会话内生效
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
