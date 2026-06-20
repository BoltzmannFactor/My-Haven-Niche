'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {

  const [text, setText] = useState('');
  const [posts, setPosts] = useState([
    { id: 1, content: '今天开始学习 **Next.js** 了！🎉', time: '刚刚' },
    { id: 2, content: '用 `Tailwind CSS` 写样式真的好快。', time: '5分钟前' }
  ]);

  const handlePublish = () => {
    if (!text.trim()) return;
    setPosts([{ id: Date.now(), content: text, time: '刚刚' }, ...posts]);
    setText('');
  };
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-pink-100 to-blue-100">
      <div className="max-w-2xl mx-auto pt-8">
        <h1 className="text-3xl font-bold text-center mb-8">📝 我的小站</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <textarea 
            placeholder="此刻的想法... 支持 Markdown ✨"
            className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button 
            onClick={handlePublish}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition"
          >
            发布
          </button>
          <span className="ml-3 text-xs text-gray-400">支持 Markdown</span>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md p-4">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }) {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <div className="bg-gray-100 rounded-lg p-4 my-2 overflow-x-auto">
                          <code className="text-gray-800 text-sm font-mono" {...props}>
                            {children}
                          </code>
                        </div>
                      );
                    }
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
              <span className="text-xs text-gray-400 block mt-2">{post.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}