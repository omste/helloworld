import { db } from '@/lib/db';

// Ensure DATABASE_URL is available. For server-side, it should be directly accessible.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set for Drizzle client');
}

/**
 * Creates context.
 * In a Server Action, you might call this with custom arguments like an IP address.
 */
export async function createContext(opts?: { ip?: string }) {
  if (!db) {
    throw new Error('Database is not initialized');
  }
  
  return {
    db,
    ip: opts?.ip || 'unknown',
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>; 