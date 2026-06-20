'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getData, addData } from './lib/data';

interface Post {
  id: number;
  content: string;
  time: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    getData<Post>('shuoshuo').then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  // 发布说说
  const handlePublish = async () => {
    if (!text.trim()) return;
    const success = await addData('shuoshuo', { content: text });
    if (success) {
      const newData = await getData<Post>('shuoshuo');
      setPosts(newData);
      setText('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-pink-100 to-blue-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

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