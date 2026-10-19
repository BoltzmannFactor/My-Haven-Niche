import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '维护中',
  description: '站点正在维护，稍后回来。',
};

// 恢复时间从环境变量读取，避免把一次性文案写死在代码里然后过期。
// 维护时在 .env / Vercel 环境变量里设 NEXT_PUBLIC_MAINTENANCE_ETA 即可。
const eta = process.env.NEXT_PUBLIC_MAINTENANCE_ETA;

export default function MaintenancePage() {
  return (
    <div className="max-w-2xl mx-auto p-6 pt-16 text-center">
      <div className="text-6xl mb-6" aria-hidden="true">🔧</div>
      <h1 className="text-2xl font-light tracking-[0.15em] text-[var(--text-primary)] mb-3">
        森林正在整理琴谱
      </h1>
      <p className="text-[var(--text-secondary)] font-light leading-relaxed mb-6">
        站点正在维护，钢琴师很快回来。
      </p>
      <p className="text-sm font-light text-[var(--text-faint)]">
        {eta ? `预计 ${eta} 恢复` : '完成后会立刻开放'}
      </p>
    </div>
  );
}
