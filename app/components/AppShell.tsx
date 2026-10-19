'use client';

import { useCallback, useState } from 'react';
import Navbar from './Navbar';
import SplashScreen from './SplashScreen';

export default function AppShell({ children }: { children: React.ReactNode }) {
  // SSR 阶段先渲染开场动画，服务端和客户端首帧一致，不会出现水合不匹配。
  // layout.tsx 的内联脚本已经把状态写到 <html data-splash> 上：
  // - 看过或开启了「减少动效」→ CSS 会在首帧绘制前把它隐藏（见 globals.css）
  // - 首次访问 → 正常播放，结束 / 点击跳过后写入 localStorage，下次不再出现
  // 是否播放由 SplashScreen 自己决定，所以这里不需要在 effect 里判断并设置 state。
  const [dismissed, setDismissed] = useState(false);
  const handleEnter = useCallback(() => setDismissed(true), []);

  return (
    <>
      {!dismissed && <SplashScreen onEnter={handleEnter} />}
      <Navbar />
      {/* 顶部内边距跟随 Navbar 实测高度，避免导航换行后遮住正文 */}
      <main className="pt-[var(--nav-h)] pb-16 min-h-screen">{children}</main>
    </>
  );
}
