import type { Metadata } from 'next';
import { countPlayable, getPlaylists } from '../lib/music';
import { formatDate } from '../lib/format';
import Markdown from '../components/Markdown';
import TrackList from '../components/TrackList';

export const metadata: Metadata = {
  title: '音乐',
  description: '大多是钢琴，安静的那一种 —— 点一首，底部会出现播放条，切页面也不会停。',
};

export default function MusicPage() {
  const playlists = getPlaylists();

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <h1 className="text-3xl font-light tracking-[0.2em] text-[var(--text-primary)] mb-2">
        ♪ 音乐
      </h1>
      <p className="text-sm font-light text-[var(--text-secondary)] mb-8">
        分享喜欢的音乐 —— 大多是钢琴，安静的那一种。
      </p>

      {playlists.length === 0 ? (
        <div className="surface-card rounded-2xl p-6">
          <p className="text-sm font-light text-[var(--text-primary)]">还没有歌单。</p>
          <p className="text-sm font-light text-[var(--text-secondary)] mt-3 leading-relaxed">
            在 <code className="px-1.5 py-0.5 rounded bg-[var(--code-bg)]">content/music/</code>{' '}
            下新建一个 Markdown 文件就会自动出现在这里，格式见 README。
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {playlists.map((playlist) => (
            <section key={playlist.id} id={playlist.id}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <h2 className="text-lg font-light text-[var(--text-primary)]">
                  {playlist.title}
                </h2>
                <span className="text-xs font-light text-[var(--text-faint)]">
                  {formatDate(playlist.date)}
                </span>
                <span className="text-xs font-light text-[var(--text-faint)]">
                  {countPlayable(playlist)} / {playlist.tracks.length} 首可播
                </span>
              </div>

              {playlist.summary && (
                <p className="text-sm font-light text-[var(--text-secondary)] mb-4">
                  {playlist.summary}
                </p>
              )}

              {playlist.body && (
                <div className="mb-5">
                  <Markdown>{playlist.body}</Markdown>
                </div>
              )}

              <TrackList playlistId={playlist.id} tracks={playlist.tracks} />
            </section>
          ))}
        </div>
      )}

      <p className="mt-12 text-xs font-light text-[var(--text-faint)] leading-relaxed">
        播放用的是网易云官方外链播放器。它对 VIP 曲目是静默失败的 —— 点了播放没反应，
        也不报错，所以歌单里放的都是能免费播放的版本。
      </p>
    </div>
  );
}
