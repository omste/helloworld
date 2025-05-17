import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
  });
}

export { redis, ratelimit };

/**
 * Example Rate Limiter: Allow 10 requests per 10 seconds.
 * The identifier will typically be a user ID or IP address.
 */
export const rateLimiter = new Ratelimit({
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