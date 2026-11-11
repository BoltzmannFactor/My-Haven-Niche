'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { Track } from '../lib/music';
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';

const STORAGE_KEY = 'windlog-player';

/**
 * 网易云「外链直连」地址：对免费曲目（fee=0）会 302 到真实的 audio/mpeg，
 * 于是播放器可以完全自绘 —— 不再嵌网易云的白色 iframe。
 * 约束与外链 iframe 一致：会员曲拿不到直链，audio 会报错，界面上提示换一首即可。
 */
function audioSrc(id: string): string {
  return `https://music.163.com/song/media/outer/url?id=${encodeURIComponent(id)}.mp3`;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

interface PlayerState {
  playlistId: string | null;
  tracks: Track[];
  index: number;
  visible: boolean;
  /** 期望中的播放状态（真正的暂停/播放由 <audio> 同步） */
  playing: boolean;
  /** 当前曲目拿不到直链（下架 / 会员曲）时置真，切歌即清除 */
  error: boolean;
}

const EMPTY_STATE: PlayerState = {
  playlistId: null,
  tracks: [],
  index: 0,
  visible: false,
  playing: false,
  error: false,
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
  // 只持久化「在听哪张单、哪首」；playing/error 是运行时状态，恢复时一律从暂停开始
  const snapshot = {
    playlistId: next.playlistId,
    tracks: next.tracks,
    index: next.index,
    visible: next.visible,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
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
      // 只恢复「在听哪首」，不试图自动播放 —— 浏览器不允许无用户激活的自动出声
      visible: Boolean(saved.visible) && tracks.length > 0,
      playing: false,
      error: false,
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
    playing: tracks.length > 0,
    error: false,
  });
}

function step(delta: number): void {
  if (state.tracks.length === 0) return;
  const next = (state.index + delta + state.tracks.length) % state.tracks.length;
  setState({ ...state, index: next, error: false });
}

function toggle(): void {
  if (state.tracks.length === 0) return;
  setState({ ...state, playing: !state.playing, error: false });
}

function close(): void {
  setState({ ...state, visible: false, playing: false });
}

/** 由 <audio> 的事件回调同步真实状态，只有不一致时才通知，避免循环渲染 */
function syncPlaying(playing: boolean): void {
  if (state.playing === playing) return;
  setState({ ...state, playing });
}

export interface PlayerValue extends PlayerState {
  current: Track | null;
  play: typeof play;
  next: () => void;
  prev: () => void;
  toggle: typeof toggle;
  close: typeof close;
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
      toggle,
      close,
    }),
    [snapshot, next, prev]
  );
}

export default function MusicPlayer() {
  const player = useMusicPlayer();
  const barRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  // 进度是纯展示状态，放本地 useState（由事件回调更新，不碰 effect setState）
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });

  const active = Boolean(player.visible && player.current);
  const track = player.current;

  // 曲目切换 / 期望播放状态变化 → 让 <audio> 对齐
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (player.playing) {
      audio.play().catch(() => {
        // 自动续播被浏览器策略拦下（常见于「播完自动下一首」），
        // 退回暂停态，让用户手动点一次
        setState({ ...state, playing: false });
      });
    } else {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在曲目或期望状态变化时对齐
  }, [track?.netease, player.playing]);

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
  }, [active]);

  const seek = (event: ReactMouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(progress.duration) || progress.duration <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * progress.duration;
  };

  const seekByKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(progress.duration) || progress.duration <= 0) return;
    if (event.key === 'ArrowRight') {
      audio.currentTime = Math.min(audio.currentTime + 5, progress.duration);
    } else if (event.key === 'ArrowLeft') {
      audio.currentTime = Math.max(audio.currentTime - 5, 0);
    } else {
      return;
    }
    event.preventDefault();
    setProgress((prev) => ({ ...prev, currentTime: audio.currentTime }));
  };

  if (!active || !track) return null;

  const hasMultiple = player.tracks.length > 1;
  const ratio =
    progress.duration > 0 ? Math.min(progress.currentTime / progress.duration, 1) : 0;

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="音乐播放器"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[min(42rem,calc(100%-1.5rem))] rounded-[2rem] border-2 border-[var(--card-border-strong)] bg-[var(--nav-bg)] shadow-[0_5px_0_var(--pop-shadow)] backdrop-blur-xl transition-colors duration-500"
    >
      {/* 退出键：缩小挂在右上角 */}
      <button
        type="button"
        onClick={player.close}
        aria-label="关闭播放器"
        className="absolute top-1.5 right-2.5 w-6 h-6 rounded-full border-2 border-[var(--card-border-strong)] bg-[var(--card-bg)] inline-flex items-center justify-center text-[10px] leading-none text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover-bg)] transition-all duration-150"
      >
        ✕
      </button>

      <div className="pl-5 pr-11 py-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={player.prev}
            disabled={!hasMultiple}
            aria-label="上一首"
            className="player-btn"
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={player.toggle}
            aria-label={player.playing ? '暂停' : '播放'}
            className="player-btn h-9 min-w-[2.25rem] text-sm"
          >
            {player.playing ? '⏸' : '▶'}
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
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
              {track.title}
            </p>
            {track.artist && (
              <p className="truncate text-xs font-light text-[var(--text-secondary)]">
                {track.artist}
              </p>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <div
              role="slider"
              aria-label="播放进度"
              aria-valuemin={0}
              aria-valuemax={Math.round(progress.duration)}
              aria-valuenow={Math.round(progress.currentTime)}
              tabIndex={0}
              onClick={seek}
              onKeyDown={seekByKeyboard}
              className="flex-1 h-2 rounded-full bg-[var(--card-bg-hover)] cursor-pointer overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-150"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            {progress.duration > 0 && (
              <span className="flex-none text-[10px] tabular-nums text-[var(--text-faint)]">
                {formatTime(progress.currentTime)} / {formatTime(progress.duration)}
              </span>
            )}
          </div>
        </div>
      </div>

      {player.error && (
        <p className="px-5 pb-2 -mt-0.5 text-[10px] font-light text-[var(--accent)]">
          这一首可能已下架或需要会员，换个 ▶ 试试上一首 / 下一首
        </p>
      )}

      {/* 音频引擎：无 controls 不占版面；src 换曲即重载 */}
      <audio
        ref={audioRef}
        src={audioSrc(track.netease)}
        preload="metadata"
        onPlay={() => syncPlaying(true)}
        onPause={() => syncPlaying(false)}
        onEnded={() => {
          if (player.tracks.length > 1) step(1);
          else setState({ ...state, playing: false });
        }}
        onTimeUpdate={(event) =>
          setProgress((prev) => ({ ...prev, currentTime: event.currentTarget.currentTime }))
        }
        onLoadedMetadata={(event) => {
          const duration = event.currentTarget.duration;
          setProgress((prev) => ({
            ...prev,
            duration: Number.isFinite(duration) ? duration : 0,
          }));
        }}
        onEmptied={() => setProgress({ currentTime: 0, duration: 0 })}
        onError={() => {
          setProgress({ currentTime: 0, duration: 0 });
          setState({ ...state, playing: false, error: true });
        }}
      />
    </div>
  );
}
