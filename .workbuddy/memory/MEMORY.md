# 项目长期约定 · 风与日记 / My-Haven-Niche

## 技术基线
- Next.js 16（App Router、Turbopack）+ React 19 + TypeScript strict + Tailwind v4
- 内容全部是 `content/{shuoshuo,essays,projects,music}/*.md`，gray-matter 解析，react-markdown + remark-gfm 渲染
- **无数据库、无写接口、纯静态**：内容在构建期从 `content/` 读入。
  2026-10-18 删掉 Redis 在线发布（`lib/cache.ts`、`api/data/`、依赖 `redis`/`@vercel/kv`）；
  2026-10-19 又删掉网页发布框与鉴权（`lib/auth.ts`、`api/session/`、`api/shuoshuo/`、`ShuoshuoBoard.tsx`，
  `app/api` 目录整体消失）。**写作入口只有 Obsidian 一个**，Git 插件推送后触发 Vercel 重建（延迟 1–3 分钟）。
  被删的这套实现留在 git 提交 `4e391e3`，需要时可 revert 找回。

## 必须遵守的边界
1. **`app/lib/content.ts` 与 `app/lib/music.ts` 含 `fs`，禁止被客户端组件引用**（包括间接引用）。客户端需要日期/分类名，只能用 `app/lib/format.ts`；只有 `import type` 安全（编译后会被擦除）。
2. **主题只允许用 CSS 变量**：`var(--text-primary)` 这类；不要写死颜色，也不要在 `layout.tsx` 的 body 上挂 Tailwind 渐变色 class（会覆盖主题背景）。
3. 主题状态是 `<html data-theme>`，由 `layout.tsx` 的 `<head>` 内联脚本在首帧前设置；组件读取用 `useSyncExternalStore`，不要在 effect 里 setState。
4. 导航高度由 `--nav-h` 驱动（Navbar 用 ResizeObserver 写入），页面顶部间距不要写死 `pt-16`。
5. 新增构建产物目录（如 `.next_old_*`）必须加进 `.gitignore`，否则 Tailwind v4 会把里面的旧类名当源码扫描。`.obsidian/` 同理，已忽略。
6. **不要重新引入写接口**：用户明确选择「只在 Obsidian 里写，网页不放发布框」，理由是省 Vercel 构建配额、
   有 git 版本历史、且零密钥零风险。要加回发布能力前先问，别自作主张。
7. 任何密钥类变量**绝不能加 `NEXT_PUBLIC_` 前缀**——会被打进浏览器 bundle。

## 环境变量
只剩三个可选：`NEXT_PUBLIC_SITE_URL` / `MAINTENANCE_MODE` / `NEXT_PUBLIC_MAINTENANCE_ETA`，见 `.env.example`。
一个都不填站点也能正常部署运行。

## 音乐播放
- 歌单 = `content/music/*.md`，frontmatter 的 `tracks[].netease` 是网易云歌曲 id；加载器 `app/lib/music.ts`
  **刻意不并入 `content.ts` 的 Collection**，否则归档页和标签云会混进歌单
- 播放条 `MusicPlayer` 挂在 AppShell（layout 层）→ 路由切换不卸载，跨页连续播放。
  状态用**模块级 external store + `useSyncExternalStore`**，不是 Context Provider ——
  因为 lint 规则 `react-hooks/set-state-in-effect` 禁止在 effect 里 setState（读 localStorage 恢复状态会踩）
- 高度写进 `--player-h`；`main` 的 class 是 `.app-main`，上下 padding 分别跟随 `--nav-h` 与 `--player-h`
- **网易云外链 iframe 的三个坑（实测）**：① VIP 曲**静默失败**（`fee>0` 直接跳过，点了没反应也不报错），
  选曲必须挑免费曲，付费的原版要换翻弹版；② 跨域 iframe 无法被父页面控制，切歌只能换 src（重载），
  且 `auto=1` 基本无效（不继承父页用户激活）；③ 移动 UA 会被 302 到 `http://` 移动版而被混合内容拦截，
  需判 UA 走 `https://music.163.com/m/outchain/player`。`height` 只认 32/66/90，其它值会变成 430 的大播放器

## Obsidian 约定
- vault 根必须是**仓库根**（不是 `content/`），否则 Obsidian Git 插件找不到 `.git`
- 远端：`origin = https://github.com/BoltzmannFactor/My-Haven-Niche.git`，分支 `main`。本机已缓存凭据，`GIT_TERMINAL_PROMPT=0 git push origin main` 可直接推送
- `.obsidian/app.json` 与 `.obsidian/plugins/obsidian-git/data.json` 已预写好（排除目录 + 10 分钟自动同步 + 开机自动 pull），装插件后自动生效，不用手调。**不要**写 `community-plugins.json`，插件没装时启动会报加载失败
- 新建笔记默认落 `content/shuoshuo`，附件落 `content/assets`（都在 vault 内，Obsidian 能看到）
- Obsidian Git 插件的 commit-and-sync 间隔设 10 分钟，太频繁会耗尽 Vercel 构建配额

## 本地构建注意
- 环境有 safe-delete 钩子：`rm` 会被拦，删除文件用 `mv` 移到 `C:\Users\34580\.windlog-build-trash\`
- `next build` 末尾固定报 `[safe-delete] .next/export` 失败，产物完整，属环境问题
- 清缓存用 `mv .next` 而不是 `rm -rf .next`（并把目标移出项目目录）
- **删掉 route 后直接跑 `tsc --noEmit` 会报找不到 `app/api/data/route.js`**——它读的是 `.next/types/validator.ts` 里的旧引用，`mv .next` 清掉再跑
- OG 图（ImageResponse / satori）内置字体无中文字形，只能用拉丁字符
- **本机没有 `gh` 和 `vercel` CLI**：GitHub PAT 生成、Vercel 环境变量配置只能交给用户在网页端做
- Git Bash 里 `timeout` 会被解析成 Windows 的 `TIMEOUT.EXE`（报「无效语法」），不要用它给命令限时
