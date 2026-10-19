# 项目长期约定 · 风与日记 / My-Haven-Niche

## 技术基线
- Next.js 16（App Router、Turbopack）+ React 19 + TypeScript strict + Tailwind v4
- 内容全部是 `content/{shuoshuo,essays,projects}/*.md`，gray-matter 解析，react-markdown + remark-gfm 渲染
- **无数据库**：2026-10-18 起 Redis 在线发布整套删除（`lib/cache.ts`、`api/data/` 已移除，`redis`/`@vercel/kv` 依赖已卸载）
- 说说的网页发布 = 经 GitHub Contents API 往 `content/shuoshuo/` 提交 md 文件，一次提交同时触发 Vercel 重建和落进仓库（Obsidian pull 拉到）

## 必须遵守的边界
1. **`app/lib/content.ts` 含 `fs`、`app/lib/auth.ts` 含 `node:crypto`，都禁止被客户端组件引用**（包括间接引用）。客户端需要日期/分类名，只能用 `app/lib/format.ts`。
2. **主题只允许用 CSS 变量**：`var(--text-primary)` 这类；不要写死颜色，也不要在 `layout.tsx` 的 body 上挂 Tailwind 渐变色 class（会覆盖主题背景）。
3. 主题状态是 `<html data-theme>`，由 `layout.tsx` 的 `<head>` 内联脚本在首帧前设置；组件读取用 `useSyncExternalStore`，不要在 effect 里 setState。
4. 导航高度由 `--nav-h` 驱动（Navbar 用 ResizeObserver 写入），页面顶部间距不要写死 `pt-16`。
5. 新增构建产物目录（如 `.next_old_*`）必须加进 `.gitignore`，否则 Tailwind v4 会把里面的旧类名当源码扫描。`.obsidian/` 同理，已忽略。
6. **鉴权相关的四个变量绝不能加 `NEXT_PUBLIC_` 前缀**——会被打进浏览器 bundle，等于公开口令和仓库写权限。客户端要知道能不能发布，只能由服务端组件传 `canPost` prop。

## 环境变量
`POST_PASSWORD` / `AUTH_SECRET` / `GITHUB_TOKEN` / `GITHUB_REPO` / `NEXT_PUBLIC_SITE_URL` / `MAINTENANCE_MODE` / `NEXT_PUBLIC_MAINTENANCE_ETA`，见 `.env.example`。
前四个缺任一，网页发布功能整体关闭（页面不显示发布框，接口拒绝）。

## Obsidian 约定
- vault 根必须是**仓库根**（不是 `content/`），否则 Obsidian Git 插件找不到 `.git`
- vault 打开后第一件事：设置 → 文件与链接 → Excluded files 加 `node_modules` / `.next` / `.workbuddy` / `.git`，否则会去索引 node_modules 里几百个 md 而卡死
- Obsidian Git 插件的 commit-and-sync 间隔设 10 分钟，太频繁会耗尽 Vercel 构建配额

## 本地构建注意
- 环境有 safe-delete 钩子：`rm` 会被拦，删除文件用 `mv` 移到 `C:\Users\34580\.windlog-build-trash\`
- `next build` 末尾固定报 `[safe-delete] .next/export` 失败，产物完整，属环境问题
- 清缓存用 `mv .next` 而不是 `rm -rf .next`（并把目标移出项目目录）
- **删掉 route 后直接跑 `tsc --noEmit` 会报找不到 `app/api/data/route.js`**——它读的是 `.next/types/validator.ts` 里的旧引用，`mv .next` 清掉再跑
- OG 图（ImageResponse / satori）内置字体无中文字形，只能用拉丁字符
