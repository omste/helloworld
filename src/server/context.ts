import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

// Initialize database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

export interface Context {
  db: typeof db;
  ip: string;
}

export const createContext = async (opts?: FetchCreateContextFnOptions) => {
  // Get IP from request headers or fallback to localhost
  const ip = opts?.req.headers.get('x-forwarded-for') ?? 
             opts?.req.headers.get('x-real-ip') ?? 
             '127.0.0.1';

  return {
    db,
    ip: typeof ip === 'string' ? ip : '127.0.0.1',
  };
}; 