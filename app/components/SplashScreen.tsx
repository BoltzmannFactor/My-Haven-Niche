'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onEnter: () => void;
}

const STORAGE_KEY = 'windlog-splash-seen';
const DURATION = 4000;
const EXIT_ANIMATION = 700;

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const leavingRef = useRef(false);

  const leave = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // localStorage 不可写时不影响本次进入，只是下次还会再播一次
    }
    setIsExiting(true);
    window.setTimeout(() => onEnter(), EXIT_ANIMATION);
  }, [onEnter]);

  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // layout.tsx 的内联脚本已经把「是否该播放」写到 <html data-splash> 上
    const shouldPlay = document.documentElement.getAttribute('data-splash') === 'play';

    if (!shouldPlay || reduce) {
      // 异步回调里通知父组件卸载，避免在 effect 中同步 setState 触发级联渲染
      const timer = window.setTimeout(() => onEnter(), 0);
      return () => window.clearTimeout(timer);
    }

    document.body.style.overflow = 'hidden';

    const startTime = Date.now();
    let raf = 0;

    const animate = () => {
      const p = Math.min((Date.now() - startTime) / DURATION, 1);
      setProgress(p * 100);
      if (p < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        leave();
      }
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
    };
  }, [leave, onEnter]);

  const notes = [
    { pos: 5 }, { pos: 15 }, { pos: 25 }, { pos: 38 },
    { pos: 48 }, { pos: 60 }, { pos: 72 }, { pos: 85 }, { pos: 93 }
  ];

  return (
    <div
      id="splash-root"
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-start)] via-[var(--bg-mid)] to-[var(--bg-end)] transition-transform duration-700 ${
        isExiting ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <button
        type="button"
        onClick={leave}
        className="absolute top-5 right-5 px-4 py-2 rounded-full text-xs font-light tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--nav-bg)] hover:bg-[var(--nav-hover-bg)] border border-[var(--nav-border)] transition-colors"
      >
        跳过 ✦
      </button>

      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-7xl font-light tracking-[0.4em] text-[var(--text-primary)]/60">
          风与日记
        </h1>
        <div className="w-8 h-[1px] bg-[var(--text-primary)]/30 mx-auto mt-4" />
        <p className="text-[var(--text-faint)] text-sm font-light tracking-[0.2em] mt-4">
          晨雾森林里的钢琴
        </p>
      </div>

      {/* 五线谱 */}
      <div className="w-[300px] md:w-[500px] relative h-24">
        <svg className="w-full h-full" viewBox="0 0 500 80" preserveAspectRatio="none">
          {[12, 24, 36, 48, 60].map((y, idx) => (
            <line
              key={idx}
              x1="0"
              y1={y}
              x2="500"
              y2={y}
              stroke="var(--text-primary)"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          ))}

          <clipPath id="progressClip">
            <rect x="0" y="0" width={`${progress}%`} height="80" />
          </clipPath>

          <g clipPath="url(#progressClip)">
            {[12, 24, 36, 48, 60].map((y, idx) => (
              <line
                key={`light-${idx}`}
                x1="0"
                y1={y}
                x2="500"
                y2={y}
                stroke="var(--accent)"
                strokeOpacity="0.6"
                strokeWidth="1.5"
              />
            ))}
          </g>

          {notes.map((note, idx) => {
            const isActive = note.pos <= progress;
            const stroke = isActive ? 'var(--accent)' : 'var(--text-primary)';
            const noteY = 20 + Math.sin(idx * 1.2) * 15 + 8;
            return (
              <g key={idx} opacity={isActive ? 1 : 0.15}>
                <circle cx={note.pos * 5} cy={noteY} r="4" fill={stroke} />
                <line
                  x1={note.pos * 5 + 3}
                  y1={noteY}
                  x2={note.pos * 5 + 3}
                  y2={noteY - 16}
                  stroke={stroke}
                  strokeWidth="1.5"
                />
                {idx % 2 === 0 && (
                  <path
                    d={`M${note.pos * 5 + 3} ${noteY - 16} Q${note.pos * 5 + 14} ${noteY - 12} ${note.pos * 5 + 10} ${noteY - 5}`}
                    stroke={stroke}
                    strokeWidth="1.5"
                    fill="none"
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[var(--text-faint)] text-xs font-light tracking-widest">
          {Math.round(progress)}%
        </div>
      </div>

      <p className="text-[var(--text-faint)] text-sm font-light mt-14 tracking-widest animate-pulse">
        ✦ 聆听 · 森林在歌唱 ✦
      </p>
    </div>
  );
}
