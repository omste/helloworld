import { db } from '@/lib/db';

// Only check for DATABASE_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set for Drizzle client');
}

/**
 * Creates context.
 * In a Server Action, you might call this with custom arguments like an IP address.
 */
export async function createContext(opts?: { ip?: string }) {
  // Only require database in production
  if (process.env.NODE_ENV === 'production' && !db) {
    throw new Error('Database is not initialized');
  }
  
  return {
    db: db || null,
    ip: opts?.ip || 'unknown',
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>; 