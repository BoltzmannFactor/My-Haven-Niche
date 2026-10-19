'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto p-6 pt-16 text-center">
      <div className="text-6xl font-light text-[var(--text-primary)]/30 mb-4">✧</div>
      <h1 className="text-2xl font-light tracking-[0.15em] text-[var(--text-primary)] mb-3">
        琴弦断了一根
      </h1>
      <p className="text-[var(--text-secondary)] font-light leading-relaxed mb-3">
        页面加载时出了点问题，请再试一次。
      </p>
      {error.digest && (
        <p className="text-xs text-[var(--text-secondary)]/60 font-light mb-8">
          错误编号：{error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="px-5 py-2 rounded-full text-sm font-light bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] hover:bg-[var(--card-bg-hover)] transition-all duration-300"
      >
        ↻ 重新演奏
      </button>
    </div>
  );
}
