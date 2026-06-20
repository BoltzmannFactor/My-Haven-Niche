'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '项目', path: '/projects', icon: '💻' },
  { name: '归档', path: '/archives', icon: '📚' },
  { name: '照片墙', path: '/photos', icon: '📸' },
  { name: '音乐', path: '/music', icon: '🎵' },
  { name: '灵境', path: '/realm', icon: '🌌' },
  { name: '说说', path: '/shuoshuo', icon: '💬' },
  { name: '杂谈', path: '/essays', icon: '✍️' },
  { name: '关于', path: '/about', icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center py-3">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
            Windlog
          </div>
          
          <div className="flex flex-wrap justify-center gap-1 md:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all duration-200
                    flex items-center gap-1.5
                    ${isActive 
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}