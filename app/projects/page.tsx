import type { Metadata } from 'next';
import Markdown from '../components/Markdown';
import TagList from '../components/TagList';
import { getCollection } from '../lib/content';
import { formatDate } from '../lib/format';

export const metadata: Metadata = {
  title: '项目',
  description: '用代码写诗 —— 做完的、没做完的、还在改的东西。',
};

export default function ProjectsPage() {
  const projects = getCollection('projects');

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ◈ 项目
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        用代码写诗。共 {projects.length} 个。
      </p>

      {projects.length === 0 ? (
        <p className="text-sm font-light text-[var(--text-secondary)] surface-card rounded-2xl p-6">
          还没有项目。在 content/projects/ 下新建一个 .md 文件即可。
        </p>
      ) : (
        <ul className="space-y-6">
          {projects.map((project) => (
            <li key={project.id} id={project.id} className="surface-card rounded-2xl p-6 scroll-mt-24">
              <article>
                <header className="mb-4">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <h2 className="text-xl font-light text-[var(--text-primary)]">
                      {project.title}
                    </h2>
                    {project.status && (
                      <span className="px-2 py-0.5 rounded-full border border-[var(--card-border)] text-xs text-[var(--text-secondary)]">
                        {project.status}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-faint)]">
                    <time dateTime={project.date}>{formatDate(project.date)}</time>
                    {project.stack.length > 0 && (
                      <span className="text-[var(--text-secondary)]">
                        {project.stack.join(' · ')}
                      </span>
                    )}
                  </div>

                  {project.summary && (
                    <p className="mt-3 text-sm font-light text-[var(--text-secondary)]">
                      {project.summary}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                    <TagList tags={project.tags} />
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                      >
                        访问仓库 →
                      </a>
                    )}
                  </div>
                </header>

                <Markdown>{project.content}</Markdown>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
