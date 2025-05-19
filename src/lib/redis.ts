import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// During build time, return a mock Redis instance
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined';

// Create a mock Redis instance for build time
const mockRedis = {
  get: async () => null,
  set: async () => null,
  setex: async () => null,
  del: async () => null,
  incr: async () => 1,
  // Add minimal required methods for rate limiting
  eval: async () => null,
  evalsha: async () => null,
  exists: async () => 0,
  expire: async () => true,
  ping: async () => 'PONG',
  script: async () => null,
} as unknown as Redis;

// Create a mock rate limiter for build time
const mockRateLimiter = {
  limit: async () => ({ success: true, reset: Date.now() + 10000, limit: 10, remaining: 9 }),
};

// Only check environment variables if not in build time
if (!isBuildTime) {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    throw new Error('UPSTASH_REDIS_REST_URL is not set');
  }
  if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('UPSTASH_REDIS_REST_TOKEN is not set');
  }
}

// Function to ensure URL is using HTTPS
const ensureHttpsUrl = (url: string) => {
  if (!url) return url;
  return url.replace(/^redis:\/\//, 'https://');
};

// Export Redis instance (real or mock)
export const redis = isBuildTime ? mockRedis : new Redis({
  url: ensureHttpsUrl(process.env.UPSTASH_REDIS_REST_URL!),
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Example Rate Limiter: Allow 10 requests per 10 seconds.
 * The identifier will typically be a user ID or IP address.
 */
export const rateLimiter = isBuildTime ? mockRateLimiter : new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true, // Enable analytics in Upstash console (optional)
  /**
   * Optional prefix for keys stored in Redis, useful if you share your Redis instance.
   * E.g., "@upstash/ratelimit"
   */
  prefix: "@helloworld/ratelimit", 
});

// You can create more specific rate limiters here if needed
// e.g., for specific actions or stricter limits. 