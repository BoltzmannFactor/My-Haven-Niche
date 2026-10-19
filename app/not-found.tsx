import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto p-6 pt-16 text-center">
      <div className="text-6xl font-light tracking-[0.2em] text-[var(--text-primary)]/30 mb-4">
        404
      </div>
      <h1 className="text-2xl font-light tracking-[0.15em] text-[var(--text-primary)] mb-3">
        这片林子里没有路
      </h1>
      <p className="text-[var(--text-secondary)] font-light leading-relaxed mb-8">
        你要找的页面被风吹走了，或者从未存在过。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="px-5 py-2 rounded-full text-sm font-light bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] hover:bg-[var(--card-bg-hover)] transition-all duration-300"
        >
          ✦ 回到首页
        </Link>
        <Link
          href="/archives"
          className="px-5 py-2 rounded-full text-sm font-light bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)] transition-all duration-300"
        >
          ◌ 去归档看看
        </Link>
      </div>
    </div>
  );
}
