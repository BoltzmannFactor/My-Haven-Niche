'use client';

import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onEnter: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 启动页显示时锁定滚动
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      document.body.style.overflow = 'auto';
      onEnter();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-700 ${
        isExiting ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="text-center text-white animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-bold tracking-wide mb-4">
          Windlog
        </h1>
        <p className="text-lg md:text-xl opacity-80 mb-8">追风者的日志</p>
        <div
          onClick={handleEnter}
          className="inline-block cursor-pointer animate-bounce text-4xl hover:scale-110 transition-transform"
        >
          ↓
        </div>
      </div>
    </div>
  );
}