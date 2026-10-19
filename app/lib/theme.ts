// 主题相关常量与工具。
// 主题不再由 JS 逐个 setProperty 写内联变量（内联样式会压过 CSS 规则，也让 :root 里的
// 两套主题定义形同虚设），改为统一在 <html data-theme="forest|fantasy"> 上切换，
// 颜色全部由 globals.css 的变量提供。
export type Theme = 'forest' | 'fantasy';

export const THEME_STORAGE_KEY = 'windlog-theme';

/** 同页面内切换时，用自定义事件通知其它组件（storage 事件只在跨标签页触发） */
export const THEME_CHANGE_EVENT = 'windlog:theme-change';

export const DEFAULT_THEME: Theme = 'forest';

export function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'fantasy' || value === 'forest' ? value : null;
  } catch {
    return null;
  }
}

/** 读取当前生效的主题：<head> 里的内联脚本已经把值写到 <html> 上了 */
export function readAppliedTheme(): Theme {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'fantasy' ? 'fantasy' : DEFAULT_THEME;
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
