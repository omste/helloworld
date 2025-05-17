import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

// Only initialize if we have a valid Neon database URL
if (process.env.DATABASE_URL && 
    (process.env.DATABASE_URL.includes('.neon.tech/') || process.env.NODE_ENV !== 'production')) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // In production, we might want to throw here
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

export { db }; 