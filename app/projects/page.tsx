import type { Metadata } from 'next';
import Markdown from '../components/Markdown';
import Reveal from '../components/Reveal';
import {
  PROJECT_STATUSES,
  getProjects,
  getProjectsSyncedAt,
  type Project,
} from '../lib/projects';

export const metadata: Metadata = {
  title: '项目',
  description: '项目工作台 —— 做完的、没做完的、还在改的东西，数据每天自动同步。',
};

/** 状态 → 糖果色编号（对应 --pop-* / --tint-*） */
const STATUS_COLOR: Record<string, number> = {
  进行中: 2,
  维护中: 4,
  已上线: 1,
  搁置: 5,
};

function colorOf(status: string): number {
  return STATUS_COLOR[status] ?? 3;
}

function ProjectCard({ project }: { project: Project }) {
  const color = project.accent;
  const tint = `var(--tint-${color})`;
  const pop = `var(--pop-${color})`;
  const stamp = project.updated || project.started;

  return (
    <article
      id={project.id}
      className="card-pop card-pop-hover scroll-mt-[calc(var(--nav-h)+1.5rem)] flex flex-col p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[0.85rem] border-2 border-[var(--card-border-strong)] text-[20px] shadow-[0_3px_0_var(--pop-shadow)]"
          style={{ background: tint }}
        >
          {project.icon}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] leading-snug font-extrabold text-[var(--text-primary)]">
            {project.title}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-bold text-[var(--text-faint)]">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--card-border-strong)] px-2 py-[1px] text-[10.5px] text-[var(--text-primary)]"
              style={{ background: tint }}
            >
              <i
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: pop }}
              />
              {project.status}
            </span>
            {project.started && <span>{project.started} 起</span>}
            {project.version && <span>· v{project.version}</span>}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
        {project.summary}
      </p>

      {project.stack.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border-2 border-[var(--card-border)] px-2 py-[2px] text-[10.5px] font-bold text-[var(--text-secondary)]"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}

      {project.content && (
        <details className="group mt-4 rounded-[1rem] border-2 border-dashed border-[var(--card-border)] px-3 py-2">
          <summary className="cursor-pointer list-none text-[12px] font-extrabold text-[var(--text-secondary)] [&::-webkit-details-marker]:hidden">
            📎 项目笔记
            <span className="ml-1 text-[10.5px] font-bold text-[var(--text-faint)] group-open:hidden">
              展开
            </span>
          </summary>
          <div className="mt-2 text-[13.5px]">
            <Markdown>{project.content}</Markdown>
          </div>
        </details>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <span className="text-[11.5px] font-bold text-[var(--text-faint)]">
          {stamp ? `更新于 ${stamp}` : '还没有时间线'}
        </span>
        <div className="flex flex-wrap gap-2">
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop btn-pop-ghost"
            >
              仓库 →
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop btn-pop-primary"
            >
              去看看 →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const projects = getProjects();
  const syncedAt = getProjectsSyncedAt();

  // 已知状态按固定顺序分组；写了奇怪状态的，归到「其他」
  const groups: { status: string; items: Project[] }[] = PROJECT_STATUSES.map((status) => ({
    status,
    items: projects.filter((project) => project.status === status),
  })).filter((group) => group.items.length > 0);

  const others = projects.filter(
    (project) => !(PROJECT_STATUSES as readonly string[]).includes(project.status),
  );
  if (others.length > 0) groups.push({ status: '其他', items: others });

  const activeCount = projects.filter((project) => project.status === '进行中').length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6">
      <header>
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--card-border-strong)] bg-[var(--tint-2)] px-3.5 py-1 text-[11px] font-extrabold tracking-[0.1em] text-[var(--text-secondary)] uppercase">
          🛠️ Making things
        </span>
        <h1 className="mt-4 text-[clamp(1.9rem,1rem+4vw,2.6rem)] leading-tight font-extrabold text-[var(--text-primary)]">
          我的<span className="hl">项目工作台</span>
        </h1>
        <p className="mt-3 max-w-[36em] text-[15px] leading-relaxed text-[var(--text-secondary)]">
          共 {projects.length} 个，其中 {activeCount} 个正在做。清单来自{' '}
          <code className="rounded-md bg-[var(--code-bg)] px-1.5 py-0.5 text-[13px]">
            content/projects.json
          </code>
          {syncedAt && <>，最近一次同步是 {syncedAt}</>}。
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {groups.map((group) => (
            <li
              key={group.status}
              className="chip-pop"
              style={{ background: `var(--tint-${colorOf(group.status)})` }}
            >
              <i
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `var(--pop-${colorOf(group.status)})` }}
              />
              {group.status}
              <b className="text-[var(--text-secondary)]">{group.items.length}</b>
            </li>
          ))}
        </ul>
      </header>

      {projects.length === 0 ? (
        <div className="card-pop p-8 text-center">
          <p className="text-[20px]" aria-hidden="true">
            🧰
          </p>
          <p className="mt-2 text-[15px] font-bold text-[var(--text-primary)]">工作台还是空的</p>
          <p className="mx-auto mt-2 max-w-[30em] text-[13px] leading-relaxed text-[var(--text-secondary)]">
            在 <code className="rounded bg-[var(--code-bg)] px-1.5 py-0.5">content/projects.json</code>{' '}
            的 <code className="rounded bg-[var(--code-bg)] px-1.5 py-0.5">projects</code>{' '}
            数组里加一条，推上去就有了。
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.status} aria-labelledby={`status-${group.status}`}>
            <div className="mb-4 flex items-baseline gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full border-2 border-[var(--card-border-strong)]"
                style={{ background: `var(--pop-${colorOf(group.status)})` }}
              />
              <h2
                id={`status-${group.status}`}
                className="text-[17px] font-extrabold text-[var(--text-primary)]"
              >
                {group.status}
              </h2>
              <span className="text-[12px] font-bold text-[var(--text-faint)]">
                {group.items.length} 个
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {group.items.map((project) => (
                <Reveal key={project.id}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          </section>
        ))
      )}

      <footer className="card-pop flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <p className="text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
          想加一个项目？往 <b>projects.json</b> 里写一条；带 <b>source</b> 的会被每天自动同步。
        </p>
        <a
          href="https://github.com/BoltzmannFactor/My-Haven-Niche/blob/main/README.md"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pop btn-pop-mint"
        >
          字段说明 →
        </a>
      </footer>
    </div>
  );
}
