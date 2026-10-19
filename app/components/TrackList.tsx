'use client';

import type { Track } from '../lib/music';
import { useMusicPlayer } from './MusicPlayer';

/**
 * 歌单曲目列表。
 * 整张歌单一次性传进来，点击任一曲就把这张单子设成播放队列，
 * 底部播放条的上一首 / 下一首才有得可切。
 */
export default function TrackList({
  playlistId,
  tracks,
}: {
  playlistId: string;
  tracks: Track[];
}) {
  const player = useMusicPlayer();
  const firstPlayable = tracks.findIndex((track) => track.netease);

  if (tracks.length === 0) {
    return (
      <p className="text-sm font-light text-[var(--text-secondary)]">
        这张歌单还没有曲目。
      </p>
    );
  }

  return (
    <div>
      {firstPlayable >= 0 && (
        <button
          type="button"
          onClick={() => player.play(playlistId, tracks, firstPlayable)}
          className="mb-3 px-4 py-1.5 rounded-full text-xs font-light surface-card text-[var(--text-primary)] hover:bg-[var(--card-bg-hover)] transition-colors duration-300"
        >
          ▶ 播放整张
        </button>
      )}

      <ol className="space-y-2">
        {tracks.map((track, index) => {
          const playable = Boolean(track.netease);
          const isCurrent = playable && player.current?.netease === track.netease;
          const searchUrl = `https://music.163.com/#/search/m/?s=${encodeURIComponent(
            `${track.title} ${track.artist}`
          )}`;

          return (
            <li
              key={`${track.title}-${track.artist}-${index}`}
              className={`surface-card rounded-2xl px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-1 transition-colors duration-300 ${
                isCurrent ? 'border-[var(--accent)]' : ''
              }`}
            >
              <button
                type="button"
                disabled={!playable}
                onClick={() => player.play(playlistId, tracks, index)}
                aria-label={
                  playable
                    ? `播放 ${track.title}${track.artist ? ` — ${track.artist}` : ''}`
                    : `${track.title} 未绑定网易云 id，暂时无法播放`
                }
                aria-current={isCurrent ? 'true' : undefined}
                className="flex flex-1 min-w-[12rem] items-baseline gap-x-4 text-left disabled:cursor-default"
              >
                <span className="text-xs text-[var(--text-faint)] tabular-nums w-6">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={`text-sm font-light flex-1 ${
                    isCurrent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {track.title}
                </span>
                <span className="text-xs font-light text-[var(--text-secondary)]">
                  {track.artist}
                </span>
                {track.mood && (
                  <span className="text-xs font-light text-[var(--text-faint)]">
                    {track.mood}
                  </span>
                )}
              </button>

              {isCurrent && (
                <span className="text-[10px] font-light text-[var(--accent)]">正在播放</span>
              )}
              {!playable && (
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-light text-[var(--text-faint)] hover:text-[var(--text-secondary)] underline underline-offset-2"
                >
                  去网易云找 id
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
