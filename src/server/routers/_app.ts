import { z } from 'zod';
import { publicProcedure, router, rateLimitedProcedure } from '../trpc';
import { messages } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { messageInputSchema, messageSchema, messageResponseSchema } from '@/lib/schemas';

export const appRouter = router({
  greeting: publicProcedure
    .output(messageResponseSchema)
    .query(async ({ ctx }) => {
      if (!ctx.db) {
        console.error('Database context is missing');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection not available',
        });
      }

      // First, let's see all messages in the database
      const allMessages = await ctx.db.select().from(messages);
      //console.log('All messages in database:', allMessages);

      const latestMessage = await ctx.db.select().from(messages).orderBy(desc(messages.id)).limit(1);
      //console.log('Latest message:', latestMessage);
      
      if (!latestMessage.length) {
        console.error('No messages found in database');
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No messages found in database',
        });
      }
      
      const result = { text: latestMessage[0].themessage };
      // console.log('Returning message:', result);
      return result;
    }),

  addMessage: rateLimitedProcedure
    .input(messageInputSchema)
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
    .output(z.array(messageSchema))
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