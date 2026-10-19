'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import type { Track } from '../lib/music';

const STORAGE_KEY = 'windlog-player';

/**
 * 网易云官方外链播放器。
 * height 是精确匹配的：32 = 最小条，66 = 中等（带封面），其它值会渲染成 430 的列表大播放器。
 * auto=1 在多数桌面浏览器不生效（跨域 iframe 不继承父页面的用户激活），
 * 但写了无害，能省的只是一次点击。
 */
function playerSrc(id: string, mobile: boolean): string {
  const base = mobile
    ? 'https://music.163.com/m/outchain/player'
    : 'https://music.163.com/outchain/player';
  return `${base}?type=2&id=${encodeURIComponent(id)}&auto=1&height=${mobile ? 32 : 66}`;
}

/**
 * 网易云在移动 UA 下会把桌面外链 302 到 http:// 的移动版地址，
 * 在 HTTPS 站点里 iframe 会因混合内容被拦而整块空白。
 * 这里直接判 UA 走 https 的移动版地址绕过那次跳转。
 */
function isMobileUA(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

interface PlayerState {
  playlistId: string | null;
  tracks: Track[];
  index: number;
  visible: boolean;
  collapsed: boolean;
}

const EMPTY_STATE: PlayerState = {
  playlistId: null,
  tracks: [],
  index: 0,
  visible: false,
  collapsed: false,
};

/*
 * 状态放在模块级 store 而不是 useState：
 * 1. 播放器挂在 layout 上，路由切换不卸载 —— 配合模块级 store，跳转后播放状态天然保留
 * 2. 只在客户端读 localStorage 恢复，又不能用 effect 里 setState（会触发额外渲染，
 *    也被 lint 规则禁掉），useSyncExternalStore 恰好是官方给的解法
 */
let state: PlayerState = EMPTY_STATE;
const listeners = new Set<() => void>();
let hydrated = false;

function setState(next: PlayerState): void {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 隐私模式下写不进去，不影响播放
  }
  listeners.forEach((listener) => listener());
}

function clampIndex(index: number, length: number): number {
  if (!length) return 0;
  return Math.min(Math.max(index, 0), length - 1);
}

function hydrate(): void {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw) as Partial<PlayerState>;
    if (!Array.isArray(saved.tracks)) return;

    const tracks = saved.tracks.filter(
      (item): item is Track => Boolean(item) && typeof item.title === 'string'
    );
    const index = typeof saved.index === 'number' ? saved.index : 0;

    state = {
      playlistId: typeof saved.playlistId === 'string' ? saved.playlistId : null,
      tracks,
      index: clampIndex(index, tracks.length),
      // 只恢复「在听哪首」，不试图自动播放 —— 跨域 iframe 拿不到用户激活，
      // 假装能自动续播只会让人困惑
      visible: Boolean(saved.visible) && tracks.length > 0,
      collapsed: Boolean(saved.collapsed),
    };
  } catch {
    // 存档坏了或 localStorage 不可用，保持空状态即可
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PlayerState {
  if (!hydrated) {
    hydrated = true;
    hydrate();
  }
  return state;
}

function getServerSnapshot(): PlayerState {
  return EMPTY_STATE;
}

function play(playlistId: string, tracks: Track[], index: number): void {
  setState({
    playlistId,
    tracks,
    index: clampIndex(index, tracks.length),
    visible: tracks.length > 0,
    collapsed: false,
  });
}

function step(delta: number): void {
  if (state.tracks.length === 0) return;
  const next = (state.index + delta + state.tracks.length) % state.tracks.length;
  setState({ ...state, index: next, collapsed: false });
}

function close(): void {
  setState({ ...state, visible: false });
}

function toggleCollapsed(): void {
  setState({ ...state, collapsed: !state.collapsed });
}

export interface PlayerValue extends PlayerState {
  current: Track | null;
  play: typeof play;
  next: () => void;
  prev: () => void;
  close: typeof close;
  toggleCollapsed: typeof toggleCollapsed;
}

export function useMusicPlayer(): PlayerValue {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const next = useCallback(() => step(1), []);
  const prev = useCallback(() => step(-1), []);

  return useMemo<PlayerValue>(
    () => ({
      ...snapshot,
      current:
        snapshot.visible && snapshot.tracks.length > 0
          ? snapshot.tracks[snapshot.index] ?? null
          : null,
      play,
      next,
      prev,
      close,
      toggleCollapsed,
    }),
    [snapshot, next, prev]
  );
}

/** 只在客户端为 true；SSR / 水合阶段返回 false，用来避免首帧渲染出不一致的 DOM */
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function useIsMobile(): boolean {
  return useSyncExternalStore(
    () => () => {},
    isMobileUA,
    () => false
  );
}

export default function MusicPlayer() {
  const player = useMusicPlayer();
  const barRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const mobile = useIsMobile();

  const active = Boolean(player.visible && player.current);
  const collapsed = player.collapsed;

  // 与 Navbar 同一套路：把实测高度写进 --player-h，页面底部留白跟随，
  // 关闭时归零，避免播放条压住正文最后几行。
  useEffect(() => {
    const el = barRef.current;
    if (!el || !active) {
      document.documentElement.style.setProperty('--player-h', '0px');
      return;
    }

    const publish = () => {
      document.documentElement.style.setProperty(
        '--player-h',
        `${Math.ceil(el.getBoundingClientRect().height)}px`
      );
    };

    publish();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', publish);
      return () => window.removeEventListener('resize', publish);
    }

    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, collapsed, mobile, isClient]);

  if (!active || !player.current) return null;

  const track = player.current;
  const hasMultiple = player.tracks.length > 1;
  const frameHeight = mobile ? 32 : 66;
  const neteaseUrl = `https://music.163.com/#/song?id=${encodeURIComponent(track.netease)}`;

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="音乐播放器"
      className="fixed bottom-0 left-0 w-full z-40 bg-[var(--nav-bg)] backdrop-blur-2xl border-t border-[var(--nav-border)] transition-colors duration-500"
    >
      <div className="max-w-6xl mx-auto px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={player.prev}
              disabled={!hasMultiple}
              aria-label="上一首"
              className="player-btn hidden sm:inline-flex"
            >
              ⏮
            </button>
            <button
              type="button"
              onClick={player.next}
              disabled={!hasMultiple}
              aria-label="下一首"
              className="player-btn"
            >
              ⏭
            </button>
            <a
              href={neteaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`在网易云打开《${track.title}》`}
              className="player-btn hidden sm:inline-flex"
            >
              ↗
            </a>
            <button
              type="button"
              onClick={player.toggleCollapsed}
              aria-label={collapsed ? '展开播放器' : '收起播放器'}
              aria-expanded={!collapsed}
              className="player-btn"
            >
              {collapsed ? '▴' : '▾'}
            </button>
            <button
              type="button"
              onClick={player.close}
              aria-label="关闭播放器"
              className="player-btn"
            >
              ✕
            </button>
          </div>

          {/* 收起时只留一行曲名，iframe 保持挂载（display:none 不会中断播放） */}
          {collapsed ? (
            <p className="flex-1 min-w-0 truncate text-xs font-light text-[var(--text-secondary)]">
              ♪ {track.title}
              {track.artist ? ` — ${track.artist}` : ''}
            </p>
          ) : (
            <div className="flex-1 min-w-0">
              {isClient ? (
                <iframe
                  key={track.netease}
                  src={playerSrc(track.netease, mobile)}
                  title={`网易云音乐播放器：${track.title}`}
                  width="100%"
                  height={frameHeight}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  className="w-full block"
                />
              ) : (
                <div style={{ height: frameHeight }} aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        {!collapsed && (
          <p aria-live="polite" className="mt-1 text-[10px] font-light text-[var(--text-faint)]">
            换歌会让播放器重新载入；若没有自动响起，点一下播放器上的 ▶
          </p>
        )}
      </div>
    </div>
  );
}
