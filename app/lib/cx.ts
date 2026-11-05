/**
 * className 拼接。刻意不引入 clsx / tailwind-merge —— 本项目只有
 * 「条件拼接」这一种需求，自己实现即可，不必为 20 行代码加一个依赖
 * （而且要避免任何需要构建期联网的东西）。
 *
 * 这个模块不 import 任何东西，所以客户端组件引用它 100% 安全。
 */
export type ClassValue = string | number | false | null | undefined;

export function cx(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ');
}
