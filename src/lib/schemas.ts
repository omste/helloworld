import { z } from 'zod';
import { messages } from '@/db/schema';
import type { InferModel } from 'drizzle-orm';

// Drizzle types
export type Message = InferModel<typeof messages>;
export type NewMessage = InferModel<typeof messages, 'insert'>;

// API schemas
export const messageInputSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
});

export const messageResponseSchema = z.object({
  text: z.string(),
});

// Validation schema for database records
export const messageSchema = z.object({
  id: z.number(),
  themessage: z.string().min(1, "Message cannot be empty"),
}).strict();

// Type inference for API
export type MessageInput = z.infer<typeof messageInputSchema>;
export type MessageResponse = {
  text: string;
}; 