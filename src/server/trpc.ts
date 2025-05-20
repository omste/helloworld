import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type Context } from '@/server/context';
import { rateLimiter } from '@/lib/redis'; // Import our rate limiter

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    console.error('tRPC error:', error);
    return {
      ...shape,
      data: {
        ...shape.data,
        message: error.message,
        code: error.code,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware for rate limiting
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  // Use ctx.ip as the identifier. Ensure it's reliably populated.
  // If using a user ID for logged-in users, that would be even better.
  const identifier = ctx.ip; 

  if (typeof identifier !== 'string') {
    console.error('Invalid rate limit identifier');
    // Should not happen if context is always populated with a string IP
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Could not determine identifier for rate limiting.',
    });
  }

  try {
    const { success, reset } = await rateLimiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      });
    }
    // Attach limit info to context if needed by procedures, though often not necessary
    // return next({ ctx: { ...ctx, rateLimitInfo: { limit, remaining, reset } } });
    return next();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    
    console.error('Rate limiter error:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Rate limiting service unavailable',
      cause: error,
    });
  }
});

/**
 * Protected procedure that incorporates rate limiting middleware.
 */
export const rateLimitedProcedure = publicProcedure.use(rateLimitMiddleware); 