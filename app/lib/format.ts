/**
 * 纯展示逻辑：不依赖 Node API，因此既能在服务端用，也能被客户端组件安全引入。
 * 注意不要在这里 import ./content —— 那边要用 fs 读文件，
 * 一旦被客户端组件间接引用，构建会因为找不到 'fs' 直接失败。
 */

type TextCollection = 'shuoshuo' | 'essays' | 'projects';

const COLLECTION_LABEL: Record<TextCollection, string> = {
  shuoshuo: '说说',
  essays: '杂谈',
  projects: '项目',
};

export function collectionLabel(collection: TextCollection): string {
  return COLLECTION_LABEL[collection];
}

/** 手写格式化，避免依赖运行环境的 locale / 时区配置导致服务端与客户端结果不一致 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
