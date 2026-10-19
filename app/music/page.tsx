import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '音乐',
  description: '森林里的钢琴曲 —— 写代码和写字时循环的歌单。',
};

const TRACKS = [
  { title: 'River Flows in You', artist: 'Yiruma', mood: '深夜写代码' },
  { title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', mood: '下雨天' },
  { title: 'Comptine d’un autre été', artist: 'Yann Tiersen', mood: '清晨' },
  { title: 'Experience', artist: 'Ludovico Einaudi', mood: '需要专注的时候' },
  { title: 'Merry Christmas Mr. Lawrence', artist: '坂本龍一', mood: '放空' },
];

export default function MusicPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ♪ 音乐
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        分享喜欢的音乐 —— 大多是钢琴，安静的那一种。
      </p>

      <ol className="space-y-2">
        {TRACKS.map((track, index) => (
          <li
            key={track.title}
            className="surface-card rounded-2xl px-5 py-4 flex flex-wrap items-baseline gap-x-4 gap-y-1"
          >
            <span className="text-xs text-[var(--text-faint)] tabular-nums w-6">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sm font-light text-[var(--text-primary)] flex-1 min-w-[12rem]">
              {track.title}
            </span>
            <span className="text-xs font-light text-[var(--text-secondary)]">{track.artist}</span>
            <span className="text-xs font-light text-[var(--text-faint)]">{track.mood}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
