import { z } from 'zod';
import { publicProcedure, router, rateLimitedProcedure } from '../trpc';
import { messages } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const appRouter = router({
  greeting: publicProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      // Get the most recent message from the database, or use a default if none exists
      const latestMessage = await ctx.db.select().from(messages).orderBy(desc(messages.id)).limit(1);
      const messageText = latestMessage[0]?.themessage ?? `Hello ${input?.name ?? 'world'} from the server!`;
      
      return {
        text: messageText,
      };
    }),

  addMessage: rateLimitedProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.insert(messages).values({ themessage: input.text });
      return { success: true, message: `Added: ${input.text}` };
    }),

  getMessages: publicProcedure
    .query(async ({ ctx }) => {
      const allMessages = await ctx.db.select().from(messages).orderBy(desc(messages.id));
      return allMessages;
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter; 