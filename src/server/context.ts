import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema'; // Import your schema

// Ensure DATABASE_URL is available. For server-side, it should be directly accessible.
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set for Drizzle client');
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/**
 * Creates context.
 * In a Server Action, you might call this with custom arguments like an IP address.
 */
export async function createContext(opts?: { ip?: string }) {
  return {
    db,
    ip: opts?.ip ?? '127.0.0.1', // Fallback IP, be mindful of this for rate limiting
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>; 