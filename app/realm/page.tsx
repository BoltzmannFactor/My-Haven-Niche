import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '灵境',
  description: '一个想象与创造的空间 —— 关于 AI、对话与未完成构想的地方。',
};

const IDEAS = [
  { title: '会写日记的模型', body: '把多年的手稿喂进去，让它学会我的语气，然后替我写下忘记的那几天。' },
  { title: '房间式导航', body: '不是菜单，而是一个个房间：书房、琴房、暗房。走进去才是内容。' },
  { title: '风声生成器', body: '根据当地的实时风速和这一段文字的情绪，合成一段正好三分钟的背景声。' },
];

export default function RealmPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ∞ 灵境
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        一个想象与创造的空间 —— 放那些还没做完、但不想丢掉的念头。
      </p>

      <ul className="space-y-4">
        {IDEAS.map((idea) => (
          <li key={idea.title} className="surface-card rounded-2xl p-6">
            <h2 className="text-lg font-light text-[var(--text-primary)] mb-2">
              ◇ {idea.title}
            </h2>
            <p className="text-sm font-light text-[var(--text-secondary)] leading-relaxed">
              {idea.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
