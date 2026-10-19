export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-9 w-48 rounded-lg bg-[var(--card-bg)] animate-pulse" />
        <div className="h-9 w-32 rounded-full bg-[var(--card-bg)] animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] animate-pulse"
          >
            <div className="h-7 w-7 rounded bg-[var(--text-primary)]/10 mb-3" />
            <div className="h-5 w-24 rounded bg-[var(--text-primary)]/10 mb-2" />
            <div className="h-4 w-40 rounded bg-[var(--text-primary)]/10" />
          </div>
        ))}
      </div>

      <p className="text-center text-[var(--text-secondary)] text-xs tracking-widest mt-12">
        ✦ 翻开手稿 ✦
      </p>
    </div>
  );
}
