# 风与日记 · Windlog

晨雾森林里的钢琴 —— 一个用 Next.js App Router 搭的个人站，白天是「森林钢琴」，夜里是「月光手稿」。

所有内容都是仓库里的 Markdown 文件，**用 Obsidian 就能写**；不依赖数据库，也不会被平台锁住。

## 技术栈

| | |
| --- | --- |
| 框架 | Next.js 16（App Router） |
| 样式 | Tailwind CSS v4 + CSS 变量主题 |
| 语言 | TypeScript（strict） |
| 内容 | 仓库内 Markdown + gray-matter 解析 + react-markdown 渲染（含 remark-gfm，支持表格） |
| 网页发布 | 口令鉴权 + GitHub Contents API 提交 md，不经过任何数据库 |

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。不需要任何环境变量就能跑起来（此时说说页是只读的）。

```bash
npm run build   # 生产构建
npm run start   # 运行构建产物
npm run lint    # ESLint
```

## 目录结构

```text
app/
  page.tsx              首页（Server Component）
  components/           导航、主题切换、开场动画、说说墙、归档浏览器等
  lib/
    content.ts          Markdown 加载器（含 fs，只能服务端用）
    format.ts           纯格式化函数（日期、分类名），客户端组件唯一可引用的工具模块
    auth.ts             发布口令校验与会话签发（含 node:crypto，只能服务端用）
    theme.ts            主题常量与读写
  api/session/route.ts  发布口令的登录 / 登出 / 状态查询
  api/shuoshuo/route.ts 发布说说：鉴权后往仓库提交一个 Markdown 文件
  sitemap.ts robots.ts opengraph-image.tsx   SEO 三件套
  ...页面路由            /projects /archives /photos /music /realm /shuoshuo /essays /links /about
content/
  shuoshuo/*.md         短句与碎片
  essays/*.md           长文杂谈
  projects/*.md         项目介绍
proxy.ts                维护模式开关（Next 16 起 middleware 更名为 proxy）
```

> **依赖方向很重要**：客户端组件**不要**从 `lib/content.ts` 或 `lib/auth.ts` 导入任何东西（前者带 `fs`、后者带 `node:crypto`，构建直接失败）。日期/名字格式化请用 `lib/format.ts`。

## 用 Obsidian 写内容

这是推荐的写作方式 —— `content/` 就是普通的 Markdown 目录，Obsidian 直接打开即可。

**1. 用 Obsidian 打开仓库根目录**

选 `My-Haven-Niche` 这一层，不要选 `content/`。因为 **Obsidian Git 插件要求 vault 根目录就是 git 仓库**，开在 `content/` 这一层它找不到 `.git`。

**2. 排除目录已经预置好了**

仓库里带了 `.obsidian/app.json`，`Excluded files` 已填好 `node_modules` / `.next` / `.workbuddy` / `.git` 等，新建笔记默认落在 `content/shuoshuo`、附件落在 `content/assets`。首次打开就能用，不用再进设置里配。

（这步不能省 —— `node_modules` 里有几百个 `.md` 文件，不排除会让 Obsidian 索引卡死。若你想确认：`设置 → 文件与链接 → Excluded files`。）

**3. 装 Obsidian Git 插件**

从 `设置 → 第三方插件 → 社区插件` 搜索 `Obsidian Git` 安装启用即可 —— 配置也已预置在 `.obsidian/plugins/obsidian-git/data.json`：commit / push / pull 间隔均 **10 分钟**、启动时自动 pull、push 前先 pull。

不要设成每次保存就推：每次 push 都会触发一次 Vercel 全站构建，太频繁会很快耗尽月度构建配额。

**4. 写**

在 `content/shuoshuo/` 下新建 Markdown 文件，格式：

```markdown
---
title: 标题
summary: 列表页显示的一句话简介
date: 2026-10-17
tags: [随笔, 建站]
---

正文支持 **加粗**、*斜体*、`代码`、列表、引用、表格和代码块。
```

文件名去掉 `.md` 就是它的 id（也用作页面锚点）。项目页额外支持 `status`、`stack`、`link` 三个字段。

保存后开发服务器会自动热更新。`.obsidian/` 已在 `.gitignore` 里 —— 它里面全是 json 和 md，若被提交，Tailwind v4 会把它们当源码扫描并产出非法 CSS 类。

## 在网页上发说说

配齐 `POST_PASSWORD` / `AUTH_SECRET` / `GITHUB_TOKEN` / `GITHUB_REPO` 四个变量后，说说页会出现口令框。解锁后写的内容会作为一个 Markdown 文件提交到 `content/shuoshuo/`，文件名形如 `2026-10-18-224753.md`（北京时间，精确到秒，同天发多条也不撞名）。

**一次提交同时完成两件事**：触发 Vercel 重建（访客看到）+ 落进仓库（Obsidian 下次 pull 拉到）。所以「发布」和「写进 Obsidian」是同一件事，不需要额外的双向同步逻辑。

> **延迟约 1 分钟**：从提交到全站可见要等 Vercel 构建完。这是 Git 方案固有的代价，换来的是内容永不丢失、有完整版本历史、零基础设施成本。
> 如果你发得很频繁，建议改回在 Obsidian 里写、让 Git 插件攒着批量推，能显著减少构建次数。

## 鉴权

`POST /api/shuoshuo` 需要会话，因为拿到它意味着能往仓库写文件。

- 口令经 SHA-256 后做**恒定时间比对**（先摘要再比较，避免长度不等抛错、也避免明文长度泄漏）
- 会话是 HMAC 签名的 **HttpOnly Cookie**，7 天有效，服务端无状态，适合 serverless
- **失败即关闭**：`POST_PASSWORD` 或 `AUTH_SECRET` 缺一个，页面不显示发布框、接口一律拒绝
- 限流：登录尝试 5 次/分钟，发布 10 条/分钟（按 IP，内存计数）

## 主题

主题由 `<html data-theme="forest|fantasy">` 切换，两套配色集中在 `app/globals.css`。

- 组件里**只允许**写 `var(--text-primary)` 这类变量，不要写死颜色值，否则深色主题下会出现深灰字压深底
- `layout.tsx` 里有一段内联脚本在首帧前就应用已保存的主题，避免深色用户看到一闪而过的浅色背景
- 常用的组合样式已经抽成 `.surface-card` 和 `.surface-input`

## 环境变量

复制 `.env.example` 为 `.env.local` 后按需填写：

| 变量 | 作用 | 不填会怎样 |
| --- | --- | --- |
| `POST_PASSWORD` | 网页发布说说的口令 | 与 `AUTH_SECRET` 缺一即关闭发布功能，站点只读 |
| `AUTH_SECRET` | 会话 Cookie 的 HMAC 密钥 | 同上 |
| `GITHUB_REPO` | 发布目标仓库，如 `owner/repo` | 能登录但发布时报 503 |
| `GITHUB_TOKEN` | 只勾 Contents 写权限的 fine-grained PAT | 同上 |
| `NEXT_PUBLIC_SITE_URL` | sitemap / robots / OG 图的绝对地址 | 生成的是 `https://example.com` |
| `MAINTENANCE_MODE=1` | 全站跳到 `/maintenance` | 不开启维护模式 |
| `NEXT_PUBLIC_MAINTENANCE_ETA` | 维护页的预计恢复时间 | 显示「完成后会立刻开放」 |

> 前四个**绝不能**加 `NEXT_PUBLIC_` 前缀，否则会被打进浏览器 bundle。

## 部署

Vercel：导入仓库后直接部署，push 即自动重建。至少填 `NEXT_PUBLIC_SITE_URL`；想启用网页发布再把另外四个补齐。

自建服务器：`npm run build && npm start`。

## 已知遗留项

- 照片墙是占位胶片格，真实照片放到 `public/photos/` 后替换 `app/photos/page.tsx` 里的 `PHOTOS` 常量。
- 文章没有独立详情页，列表页直接展示全文；内容变多之后建议加 `[slug]` 动态路由。
- 本地清理构建缓存时如果看到 `mv .next .next_old_xxx`，记得那类目录必须留在 `.gitignore` 里——Tailwind v4 会扫描未忽略的文件找类名，旧产物会被当成源码，产出一堆非法 CSS 类。
- 网页发布每次提交都会触发一次 Vercel 构建，高频使用会消耗月度构建配额。
