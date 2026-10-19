export default function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <span className="inline-flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 rounded-full border border-[var(--card-border)] text-xs"
        >
          #{tag}
        </span>
      ))}
    </span>
  );
}
