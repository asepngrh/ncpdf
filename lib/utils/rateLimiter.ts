import { RATE_LIMIT_REQUESTS_PER_MINUTE } from "./constants";

interface RateLimitRecord {
  timestamps: number[];
}

const ipMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipMap.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        ipMap.delete(ip);
      }
    }
  }, 300000);
}

export function checkRateLimit(clientIp: string, limit = RATE_LIMIT_REQUESTS_PER_MINUTE): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipMap.get(clientIp) || { timestamps: [] };

  // Keep only timestamps within last 60 seconds
  record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);

  if (record.timestamps.length >= limit) {
    ipMap.set(clientIp, record);
    return { allowed: false, remaining: 0 };
  }

  record.timestamps.push(now);
  ipMap.set(clientIp, record);

  return { allowed: true, remaining: limit - record.timestamps.length };
}
