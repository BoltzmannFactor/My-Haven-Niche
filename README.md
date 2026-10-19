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
| 存储 | 无数据库、无写接口 —— 构建期读取 Markdown，产出纯静态页面 |

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。不需要任何环境变量就能跑起来。

```bash
npm run build   # 生产构建
npm run start   # 运行构建产物
npm run lint    # ESLint
```

## 目录结构

```text
app/
  page.tsx              首页（Server Component）
  components/           导航、主题切换、开场动画、归档浏览器、底部播放条等
  lib/
    content.ts          Markdown 加载器（含 fs，只能服务端用）
    music.ts            歌单加载器（含 fs，只能服务端用）
    format.ts           纯格式化函数（日期、分类名），客户端组件唯一可引用的工具模块
    theme.ts            主题常量与读写
  sitemap.ts robots.ts opengraph-image.tsx   SEO 三件套
  ...页面路由            /projects /archives /photos /music /realm /shuoshuo /essays /links /about
content/
  shuoshuo/*.md         短句与碎片
  essays/*.md           长文杂谈
  projects/*.md         项目介绍
  music/*.md            歌单（含曲目与网易云 id）
proxy.ts                维护模式开关（Next 16 起 middleware 更名为 proxy）
```

> **依赖方向很重要**：客户端组件**不要**从 `lib/content.ts` 或 `lib/music.ts` 导入任何东西（它们带 `fs`，构建直接失败）。日期/名字格式化请用 `lib/format.ts`。类型可以用 `import type` 导入，编译后会被擦除。

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

## 内容怎么到线上

在 Obsidian 里写完保存 → Git 插件（最多 10 分钟后）自动 commit + push → GitHub 触发 Vercel 重建 → 全站更新。

**端到端延迟约 1–3 分钟**。这是 Git 方案固有的代价，换来的是内容永不丢失、有完整版本历史、零基础设施成本 —— 站点上没有任何写接口，也就没有任何需要保护的东西。

> 每次 push 都会触发一次 Vercel 全站构建，所以不要把插件设成每次保存就推：高频推送会很快耗尽月度构建配额。

## 音乐播放

歌单也是 Markdown，放在 `content/music/`，跟文章一样用 Obsidian 维护：

```markdown
---
title: 深夜写代码
summary: 列表页显示的一句话
date: 2026-10-19
tags: [钢琴, 深夜]
tracks:
  - title: River Flows in You
    artist: Yiruma
    netease: 5312840
    mood: 深夜写代码
---

正文（可选），支持 Markdown。
```

点任意一首，页面底部会出现一条常驻播放条。它挂在 `layout` 这一层，所以**切换页面时音乐不会中断**。

### 曲目 id 怎么拿

`netease` 填网易云的歌曲 id，从网页版地址里取 —— `music.163.com/#/song?id=5312840` 里的 `5312840` 就是。留空的条目会标记为不可播，并给一个「去网易云找 id」的搜索链接。

### 一个硬性限制：只放能免费播放的曲子

播放用的是网易云官方外链播放器（iframe），它对 VIP 曲目是**静默失败**的：点了播放没反应，也不报错（内部逻辑是 `fee > 0` 就直接跳过）。

所以选曲时必须先在网易云里确认这首能免费听。原版是会员曲的话就换成翻弹版本 —— 现有歌单里的《Nuvole Bianche》和《Experience》用的就是翻弹版，Einaudi 的原版都是 VIP。

### 另外两个已知边界

- **换歌会让播放器重新载入**。跨域 iframe 取不到内部状态，父页面既读不到进度也没法调切歌，「上一首 / 下一首」只能靠替换 `src` 实现；重载后通常还要再点一下播放键，因为自动播放策略不认父页面的用户激活。
- **移动端 UA 会被网易云 302 到 `http://` 的移动版**，在 HTTPS 页面里会因混合内容被拦而整块空白。播放器已判 UA 直接走 `https` 的移动版地址，但这条链路依赖对方不改动。

## 主题

主题由 `<html data-theme="forest|fantasy">` 切换，两套配色集中在 `app/globals.css`。

- 组件里**只允许**写 `var(--text-primary)` 这类变量，不要写死颜色值，否则深色主题下会出现深灰字压深底
- `layout.tsx` 里有一段内联脚本在首帧前就应用已保存的主题，避免深色用户看到一闪而过的浅色背景
- 常用的组合样式已经抽成 `.surface-card` 和 `.surface-input`

## 环境变量

复制 `.env.example` 为 `.env.local` 后按需填写：

| 变量 | 作用 | 不填会怎样 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | sitemap / robots / OG 图的绝对地址 | 生成的是 `https://example.com` |
| `MAINTENANCE_MODE=1` | 全站跳到 `/maintenance` | 不开启维护模式 |
| `NEXT_PUBLIC_MAINTENANCE_ETA` | 维护页的预计恢复时间 | 显示「完成后会立刻开放」 |

## 部署

Vercel：导入仓库后直接部署，push 即自动重建。只需要（也建议）填一个 `NEXT_PUBLIC_SITE_URL`，其余都可以不管。

自建服务器：`npm run build && npm start`。

## 已知遗留项

- 照片墙是占位胶片格，真实照片放到 `public/photos/` 后替换 `app/photos/page.tsx` 里的 `PHOTOS` 常量。
- 文章没有独立详情页，列表页直接展示全文；内容变多之后建议加 `[slug]` 动态路由。
- 本地清理构建缓存时如果看到 `mv .next .next_old_xxx`，记得那类目录必须留在 `.gitignore` 里——Tailwind v4 会扫描未忽略的文件找类名，旧产物会被当成源码，产出一堆非法 CSS 类。
- Obsidian Git 每次 push 都会触发一次 Vercel 构建，同步间隔设得太短会消耗月度构建配额。
