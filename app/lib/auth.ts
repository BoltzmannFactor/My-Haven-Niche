import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * 发布口令的校验与会话管理。
 *
 * ⚠️ 这个模块用了 node:crypto，**只能被服务端代码引用**（Route Handler /
 * Server Component）。客户端组件一旦引用，构建会因为找不到节点内置模块而失败。
 *
 * 设计要点：
 * - 失败即关闭：POST_PASSWORD / AUTH_SECRET 缺任何一个，发布功能整体不可用。
 * - 口令比对走「先哈希、再恒定时间比较」，既避免长度不等抛错，也不泄漏明文长度。
 * - 会话 token 自带过期时间戳并用 HMAC 签名，服务端无状态，适合 serverless。
 */

export const SESSION_COOKIE = 'windlog_session';

const TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_MAX_AGE = Math.floor(TTL_MS / 1000);

/** SHA-256 摘要，用来把任意长度的输入变成定长 32 字节再比较 */
function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf-8').digest();
}

/** 两个变量都配齐才算「开启发布」。缺一个就当作关闭，绝不留裸奔的口子。 */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.POST_PASSWORD && process.env.AUTH_SECRET);
}

/**
 * 校验用户输入的口令。
 * 直接对明文调用 timingSafeEqual 在长度不等时会抛异常，且长度本身会泄漏信息，
 * 所以两边都先过一遍 SHA-256。
 */
export function checkPassword(input: string): boolean {
  const expected = process.env.POST_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(digest(input), digest(expected));
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** 生成会话 token：`<过期时间戳>.<HMAC 签名>` */
export function createSessionToken(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET 未配置，无法签发会话');
  const payload = String(Date.now() + TTL_MS);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return false;

  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = sign(payload, secret);

  // 签名定长，理论上不会不等；留着做防御，避免 timingSafeEqual 抛错
  if (provided.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(provided, 'utf-8'), Buffer.from(expected, 'utf-8'))) {
    return false;
  }

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
