const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max = 6, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }
  return { allowed: true, remaining: max - entry.count };
}

export function clientKey(scope: string, identifier: string) {
  return `${scope}:${identifier.toLowerCase().trim()}`.slice(0, 200);
}
