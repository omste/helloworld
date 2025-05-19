import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

// During build time, don't initialize the database
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined';

// Only check for DATABASE_URL when we're actually going to use it
if (!isBuildTime && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Skip database initialization during build time
const db = isBuildTime ? 
  null as any : // During build time, just return null (will never be used)
  drizzle(neon(process.env.DATABASE_URL!), { schema });

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