/**
 * 简易内存限流器 — 滑动窗口
 * 生产环境建议换用 Redis 或 SCF 内置限流
 */
const store = new Map();
const WINDOW = 60 * 1000; // 1 分钟窗口
const MAX_REQUESTS = 20;  // 每分钟最多 20 次

// 每分钟清理过期条目
setInterval(() => {
  const now = Date.now();
  for (const [key, entries] of store) {
    const valid = entries.filter(t => now - t < WINDOW);
    if (valid.length) store.set(key, valid);
    else store.delete(key);
  }
}, 60 * 1000);

export function checkRateLimit(ip) {
  if (!ip) return { allowed: true };

  const now = Date.now();
  const entries = store.get(ip) || [];
  const valid = entries.filter(t => now - t < WINDOW);

  if (valid.length >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((valid[0] + WINDOW - now) / 1000),
      limit: MAX_REQUESTS,
    };
  }

  valid.push(now);
  store.set(ip, valid);
  return { allowed: true, remaining: MAX_REQUESTS - valid.length };
}
