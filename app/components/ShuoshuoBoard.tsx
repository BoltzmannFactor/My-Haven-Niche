'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatShortDate } from '../lib/format';

interface FilePost {
  kind: 'file';
  id: string;
  date: string;
  tags: string[];
  /** 服务端已用 react-markdown 渲染好的富文本，作为 RSC 负载传给客户端组件 */
  rendered: ReactNode;
}

const MAX_LENGTH = 1000;

/** canPost 由服务端根据环境变量是否配齐决定，客户端读不到非 NEXT_PUBLIC_ 的变量 */
type Gate = 'checking' | 'locked' | 'unlocked';

/**
 * 说说墙。
 *
 * 内容只来自 content/shuoshuo/*.md —— 也就是 Obsidian vault 里的那份文件。
 * 页面上的发布框不写数据库，而是经 GitHub API 提交一个 Markdown 文件到仓库，
 * 因此「发布」和「写进 Obsidian」是同一件事；Vercel 重新构建后访客就能看到。
 */
export default function ShuoshuoBoard({
  initial,
  canPost,
}: {
  initial: FilePost[];
  canPost: boolean;
}) {
  const [gate, setGate] = useState<Gate>('checking');
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  // 刷新页面后恢复登录态：靠 HttpOnly Cookie，前端自己读不到，只能问服务端
  useEffect(() => {
    if (!canPost) return;

    let cancelled = false;
    fetch('/api/session')
      .then((res) => res.json())
      .then((json: { authed?: boolean }) => {
        if (!cancelled) setGate(json.authed ? 'unlocked' : 'locked');
      })
      .catch(() => {
        if (!cancelled) setGate('locked');
      });

    return () => {
      cancelled = true;
    };
  }, [canPost]);

  const unlock = async () => {
    if (!password) {
      setError('先输入口令');
      return;
    }

    setUnlocking(true);
    setError(null);

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? '口令不对');
        return;
      }
      setPassword('');
      setGate('unlocked');
    } catch {
      setError('网络异常，稍后再试');
    } finally {
      setUnlocking(false);
    }
  };

  const logout = async () => {
    await fetch('/api/session', { method: 'DELETE' }).catch(() => {
      // 清不掉服务端 cookie 也要退回锁定态，本地状态优先
    });
    setGate('locked');
    setNotice(null);
  };

  const submit = async () => {
    const content = draft.trim();
    if (!content) {
      setError('写点什么再发布吧');
      draftRef.current?.focus();
      return;
    }
    if (content.length > MAX_LENGTH) {
      setError(`最多 ${MAX_LENGTH} 字`);
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    setPublishedUrl(null);

    try {
      const res = await fetch('/api/shuoshuo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? '发布失败，请稍后再试');
        return;
      }

      setDraft('');
      setPublishedUrl(typeof json.url === 'string' ? json.url : null);
      setNotice('已写进 Obsidian ✦ 重新构建后（约一分钟）全站可见');
    } catch {
      setError('网络异常，发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {canPost && (
        <section id="composer" className="surface-card rounded-2xl p-5 scroll-mt-24">
          {gate === 'checking' && (
            <p className="text-sm font-light text-[var(--text-secondary)]">正在确认发布权限…</p>
          )}

          {gate === 'locked' && (
            <div>
              <label
                htmlFor="gate-password"
                className="block text-sm font-light text-[var(--text-secondary)] mb-2"
              >
                输入发布口令
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="gate-password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void unlock();
                    }
                  }}
                  className="surface-input flex-1 min-w-[12rem] rounded-xl px-3 py-2 text-sm font-light focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <button
                  type="button"
                  onClick={unlock}
                  disabled={unlocking}
                  className="px-5 py-2 rounded-full text-sm font-light text-[var(--text-primary)] bg-[var(--accent-soft)] hover:bg-[var(--nav-hover-bg)] border border-[var(--card-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unlocking ? '验证中…' : '解锁'}
                </button>
              </div>
            </div>
          )}

          {gate === 'unlocked' && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label
                  htmlFor="composer-input"
                  className="block text-sm font-light text-[var(--text-secondary)]"
                >
                  此刻在想什么？（支持 Markdown）
                </label>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-light text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  退出
                </button>
              </div>
              <textarea
                id="composer-input"
                ref={draftRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    void submit();
                  }
                }}
                rows={4}
                maxLength={MAX_LENGTH}
                placeholder="风刚好路过…"
                className="surface-input w-full rounded-xl p-3 text-sm font-light resize-y focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <div className="flex items-center justify-between gap-3 mt-3">
                <span className="text-xs text-[var(--text-faint)] tabular-nums">
                  {draft.length} / {MAX_LENGTH} · ⌘/Ctrl + Enter 发布
                </span>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="px-5 py-2 rounded-full text-sm font-light text-[var(--text-primary)] bg-[var(--accent-soft)] hover:bg-[var(--nav-hover-bg)] border border-[var(--card-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '发布中…' : '发布 ✦'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-3 text-xs text-[var(--text-primary)]">
              ✕ {error}
            </p>
          )}
          {notice && (
            <p role="status" className="mt-3 text-xs text-[var(--text-secondary)]">
              {notice}
              {publishedUrl && (
                <>
                  {' · '}
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    查看文件
                  </a>
                </>
              )}
            </p>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg font-light tracking-[0.15em] text-[var(--text-primary)] mb-4">
          全部 · {initial.length}
        </h2>

        {initial.length === 0 ? (
          <p className="text-sm font-light text-[var(--text-secondary)]">
            还没有内容。在 Obsidian 里往 content/shuoshuo/ 新建一个 Markdown 文件试试。
          </p>
        ) : (
          <ul className="space-y-3">
            {initial.map((item) => (
              <li
                key={item.id}
                id={item.id}
                className="surface-card rounded-2xl p-5 scroll-mt-24"
              >
                <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-[var(--text-faint)]">
                  <time dateTime={item.date} className="tabular-nums">
                    {formatShortDate(item.date)}
                  </time>
                  {item.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
                {item.rendered}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
