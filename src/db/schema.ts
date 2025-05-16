import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const messages = pgTable('message', {
  id: serial('id').primaryKey(),
  themessage: text('themessage').notNull(),
});

// You can add more tables here as your application grows
// export type Message = typeof messages.$inferSelect; // Select type
// export type NewMessage = typeof messages.$inferInsert; // Insert type 