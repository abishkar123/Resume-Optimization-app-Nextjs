type Preset = 'upload' | 'ai';

const LIMITS: Record<Preset, { count: number; windowMs: number }> = {
  upload: { count: 10, windowMs: 60_000 },
  ai: { count: 5, windowMs: 60_000 },
};

const buckets = new Map<string, { count: number; resetAt: number }>();

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`Rate limit exceeded. Retry after ${retryAfterSeconds}s.`);
    this.name = 'RateLimitError';
  }
}

export function checkRate(userId: string, preset: Preset): void {
  const { count, windowMs } = LIMITS[preset];
  const key = `${preset}:${userId}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= count) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    throw new RateLimitError(retryAfter);
  }

  bucket.count += 1;
}
