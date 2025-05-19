import { z } from 'zod';
import { publicProcedure, router, rateLimitedProcedure } from '../trpc';
import { messages } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const appRouter = router({
  greeting: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const latestMessage = await ctx.db.select().from(messages).orderBy(desc(messages.id)).limit(1);
        
        if (!latestMessage.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No messages found in database',
          });
        }
        
        return {
          text: latestMessage[0].themessage,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching message from database',
          cause: error,
        });
      }
    }),

  addMessage: rateLimitedProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.insert(messages).values({ themessage: input.text });
        return { success: true, message: `Added: ${input.text}` };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error adding message to database',
          cause: error,
        });
      }
    }),

  getMessages: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const allMessages = await ctx.db.select().from(messages).orderBy(desc(messages.id));
        
        if (!allMessages.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No messages found in database',
          });
        }
        
        return allMessages;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching messages from database',
          cause: error,
        });
      }
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter; 