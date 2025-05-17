import { z } from 'zod';
import { publicProcedure, router, rateLimitedProcedure } from '../trpc';
import { messages } from '@/db/schema';

export const appRouter = router({
  greeting: publicProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return {
        text: `Hello ${input?.name ?? 'world'} from the server!`,
      };
    }),

  addMessage: rateLimitedProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.insert(messages).values({ themessage: input.text });
      return { success: true, message: `Added: ${input.text}` };
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter; 