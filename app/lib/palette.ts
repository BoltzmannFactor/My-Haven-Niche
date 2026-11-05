/**
 * 主题色在 CSS 之外也要用到的几个场景（浏览器 UI 配色、OG 图）共用一份常量，
 * 避免在 layout.tsx / opengraph-image.tsx 里各硬编码一遍然后漂掉。
 *
 * ⚠️ 改这里的同时必须同步 app/globals.css 里 :root 与 [data-theme="night"] 的变量。
 *
 * 纯常量，不 import 任何东西 —— 客户端组件引用安全。
 */
export const PALETTE = {
  day: {
    themeColor: '#FFF7EC',
    from: '#FFF7EC',
    mid: '#E9F8F4',
    to: '#E7F1FF',
    ink: '#333952',
  },
  night: {
    themeColor: '#1B1F48',
    from: '#262A5C',
    mid: '#1B1F48',
    to: '#131635',
    ink: '#F2EFFF',
  },
} as const;
