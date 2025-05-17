import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

// Initialize Redis in development and test environments
try {
  if (process.env.UPSTASH_REDIS_REST_URL && 
      process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
    });
  }
} catch (error) {
  console.error('Failed to initialize Redis:', error);
}

export { redis, ratelimit };

/**
 * Example Rate Limiter: Allow 10 requests per 10 seconds.
 * The identifier will typically be a user ID or IP address.
 */
export const rateLimiter = ratelimit || {
  limit: async () => ({ success: true, reset: Date.now() + 10000 }),
};

// You can create more specific rate limiters here if needed
// e.g., for specific actions or stricter limits. 