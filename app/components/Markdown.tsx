import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// remark-gfm 提供表格、删除线、任务列表等 GitHub 风格语法。
// 少了它，Markdown 里的表格会被当成普通段落原样输出。
const REMARK_PLUGINS = [remarkGfm];

/**
 * Markdown 渲染器。
 * 只在服务端渲染（页面是 Server Component），react-markdown 不会进入客户端 bundle。
 * 排版样式见 globals.css 的 .markdown-body。
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>{children}</ReactMarkdown>
    </div>
  );
}
