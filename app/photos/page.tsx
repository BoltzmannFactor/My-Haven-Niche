import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '照片墙',
  description: '定格的光影 —— 记录生活的瞬间。',
};

// 图片放在 public/photos/ 下，用 next/image 或 <img> 都可以。
// 这里先用占位格把版式占好，把真实照片放进 public/photos 后替换 PHOTOS 常量即可。
const PHOTOS = [
  { name: '晨雾', ratio: 'aspect-[4/3]', emoji: '🌫️' },
  { name: '海边的傍晚', ratio: 'aspect-square', emoji: '🌊' },
  { name: '窗台上的猫', ratio: 'aspect-[3/4]', emoji: '🐈' },
  { name: '深夜的键盘', ratio: 'aspect-[4/3]', emoji: '🌙' },
  { name: '秋天的第一片叶子', ratio: 'aspect-square', emoji: '🍁' },
  { name: '雨后的路', ratio: 'aspect-[3/4]', emoji: '🌧️' },
];

export default function PhotosPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ✦ 照片墙
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        记录生活的瞬间 —— 目前是占位的胶片格，照片到位后会替换成真实的光影。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {PHOTOS.map((photo) => (
          <figure
            key={photo.name}
            className={`surface-card rounded-2xl overflow-hidden ${photo.ratio} flex flex-col items-center justify-center gap-2`}
          >
            <span className="text-3xl" aria-hidden="true">{photo.emoji}</span>
            <figcaption className="text-xs font-light text-[var(--text-secondary)]">
              {photo.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
