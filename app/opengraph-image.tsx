import { ImageResponse } from 'next/og';

export const alt = 'WINDLOG · 风与日记';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 分享卡片图。
 *
 * 注意：这里刻意只用拉丁字符。
 * ImageResponse 走的是 satori 渲染，内置字体不含中文字形，
 * 写中文会渲染成空白方块。若确实需要中文，
 * 需要自备字体文件并用 `fonts` 选项传入（体积通常以 MB 计）。
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #E8D5F5 0%, #C5D9F2 50%, #D4E9E2 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            letterSpacing: '0.3em',
            color: '#1E1E2A',
            opacity: 0.75,
          }}
        >
          WINDLOG
        </div>
        <div
          style={{
            width: 120,
            height: 1,
            background: '#1E1E2A',
            opacity: 0.3,
            marginTop: 24,
          }}
        />
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 32,
            letterSpacing: '0.15em',
            color: '#1E1E2A',
            opacity: 0.45,
          }}
        >
          A piano in the misty forest
        </div>
      </div>
    ),
    { ...size }
  );
}
