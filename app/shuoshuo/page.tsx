import type { Metadata } from 'next';
import Markdown from '../components/Markdown';
import ShuoshuoBoard from '../components/ShuoshuoBoard';
import { isAuthConfigured } from '../lib/auth';
import { getCollection } from '../lib/content';

export const metadata: Metadata = {
  title: '说说',
  description: '碎片化的想法和日常 —— 写在 Obsidian 里，随仓库同步到这片林子。',
};

export default function ShuoshuoPage() {
  const posts = getCollection('shuoshuo');

  // 静态内容在这里（服务端）就渲染成 React 节点，react-markdown 不会进客户端 bundle
  const initial = posts.map((post) => ({
    kind: 'file' as const,
    id: post.id,
    date: post.date,
    tags: post.tags,
    rendered: <Markdown>{post.content}</Markdown>,
  }));

  // 只有两个环境变量都配齐才显示发布框；客户端读不到非 NEXT_PUBLIC_ 的变量
  const canPost = isAuthConfigured();

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ⑅⃟◌ 说说
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        碎片化的想法和日常 —— 内容就是 Obsidian 里 content/shuoshuo/ 下的 Markdown 文件。
      </p>

      <ShuoshuoBoard initial={initial} canPost={canPost} />
    </div>
  );
}
