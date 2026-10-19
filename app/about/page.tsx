import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于',
  description: 'Windseeker · 追风者，以及这片站点的来处。',
};

const facts = [
  { label: '称呼', value: 'Windseeker / 追风者' },
  { label: '这个站', value: 'Next.js App Router + 本地 Markdown' },
  { label: '常做的事', value: '写点字、写点码、听风' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-6">
        ◇ 关于
      </h1>

      <div className="surface-card rounded-2xl p-6">
        <p className="text-[var(--text-primary)] font-light leading-relaxed">
          你好，我是 <span className="font-medium">Windseeker</span>。
        </p>
        <p className="text-[var(--text-secondary)] font-light leading-relaxed mt-3">
          这是一个用代码搭起来的私人小天地。白天是晨雾森林，夜里会换成月光手稿 ——
          两种主题都在右上角角落的按钮里。
        </p>
        <p className="text-[var(--text-secondary)] font-light leading-relaxed mt-3">
          所有文章都是仓库里的 Markdown 文件，不会被平台锁住，随时可以搬走。
          想看我写过什么，从
          <Link href="/archives" className="mx-1 text-[var(--accent)] underline underline-offset-4">
            归档
          </Link>
          开始最快。
        </p>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--divider)]">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-[var(--text-faint)] mb-1">{fact.label}</dt>
              <dd className="text-sm font-light text-[var(--text-secondary)]">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-[var(--text-faint)] font-light text-sm mt-6">
          ✦ 风与日记 · 晨雾森林里的钢琴 ✦
        </p>
      </div>
    </div>
  );
}
