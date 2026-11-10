#!/usr/bin/env node
/**
 * 项目工作台自动同步
 * ---------------------------------------------------------------------------
 * 做三件事：
 *   1. 扫 content/projects.json 里每个带 `source` 的项目目录
 *   2. 用「git 最后一次提交时间」或「目录 mtime」刷新 updated，
 *      用 package.json 刷新 version（只在变新时才写，不会往回退）
 *   3. 有变化就回写 JSON；带 --push 时再提交 + 推送，触发 Vercel 重建
 *
 * 用法：
 *   node scripts/sync-projects.mjs            # 只看本地，不提交
 *   node scripts/sync-projects.mjs --dry      # 只报告，不写文件
 *   node scripts/sync-projects.mjs --push     # 回写 + 提交 + 推送
 *
 * 注意：本机 git 全局配了 127.0.0.1:7897 的代理，代理没开时 push 会报
 * schannel handshake 失败，所以这里显式用 `-c http.proxy=` 绕过。
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'content', 'projects.json');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const PUSH = argv.includes('--push');

const log = (msg) => console.log(msg);
const warn = (msg) => console.warn(msg);

function pad(n) {
  return String(n).padStart(2, '0');
}

/** 本地时区的 YYYY-MM-DD（不用 toISOString，避免时区把日期推后一天） */
function dayOf(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function git(args, cwd = ROOT) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  }).trim();
}

function gitCode(args, cwd = ROOT) {
  try {
    git(args, cwd);
    return 0;
  } catch (error) {
    return typeof error.status === 'number' ? error.status : 1;
  }
}

/** 目录最后一次提交的日期；不是 git 仓库就返回空串 */
function lastCommitDay(dir) {
  try {
    const iso = git(['log', '-1', '--format=%cI'], dir);
    return iso ? iso.slice(0, 10) : '';
  } catch {
    return '';
  }
}

function dirMtimeDay(dir) {
  try {
    return dayOf(fs.statSync(dir).mtime);
  } catch {
    return '';
  }
}

function readVersion(dir) {
  const pkg = path.join(dir, 'package.json');
  try {
    const parsed = JSON.parse(fs.readFileSync(pkg, 'utf8'));
    return typeof parsed.version === 'string' ? parsed.version : '';
  } catch {
    return '';
  }
}

function main() {
  if (!fs.existsSync(MANIFEST)) {
    warn(`✗ 找不到 ${MANIFEST}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const projects = Array.isArray(data.projects) ? data.projects : [];

  let changed = false;
  let scanned = 0;

  for (const project of projects) {
    if (!project || typeof project !== 'object' || !project.source) continue;

    const dir = project.source;
    if (!fs.existsSync(dir)) {
      warn(`! ${project.id}: source 不存在，跳过 → ${dir}`);
      continue;
    }

    scanned += 1;
    const day = lastCommitDay(dir) || dirMtimeDay(dir);
    const known = typeof project.updated === 'string' ? project.updated : '';

    // 只往后推，避免手写的日期被旧提交时间覆盖
    if (day && day > known) {
      project.updated = day;
      changed = true;
      log(`~ ${project.id}: updated ${known || '—'} → ${day}`);
    }

    const version = readVersion(dir);
    if (version && version !== project.version) {
      project.version = version;
      changed = true;
      log(`~ ${project.id}: version → v${version}`);
    }
  }

  log(scanned === 0 ? '没有配置 source 的项目，无需同步。' : `已扫描 ${scanned} 个项目目录。`);

  if (!changed) {
    log('没有需要更新的字段。');
    return;
  }

  data.syncedAt = dayOf(new Date());

  if (DRY) {
    log('[dry] 有变更，但没有写文件。');
    return;
  }

  fs.writeFileSync(MANIFEST, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  log(`✓ 已写回 ${path.relative(ROOT, MANIFEST)}`);

  if (!PUSH) {
    log('提示：加 --push 才会提交并推送。');
    return;
  }

  git(['add', '--', 'content/projects.json']);
  if (gitCode(['diff', '--cached', '--quiet']) === 0) {
    log('暂存区没有变化，跳过提交。');
    return;
  }

  git(['commit', '-m', `chore(projects): 自动同步 ${dayOf(new Date())}`, '--', 'content/projects.json']);
  log('✓ 已提交');

  try {
    git(['-c', 'http.proxy=', '-c', 'https.proxy=', 'pull', '--rebase', '--autostash', 'origin', 'main']);
  } catch (error) {
    warn(`! 拉取远端失败，先推送试试：${error.message.split('\n')[0]}`);
  }

  git(['-c', 'http.proxy=', '-c', 'https.proxy=', 'push', 'origin', 'main']);
  log('✓ 已推送，Vercel 会自动重建（1–3 分钟）');
}

try {
  main();
} catch (error) {
  warn(`✗ 同步失败：${error.message}`);
  process.exit(1);
}
