import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { TRPCError } from '@trpc/server';

// Create a type for our database instance
type DrizzleDB = ReturnType<typeof createDrizzleInstance>;

function createDrizzleInstance() {
  if (!process.env.DATABASE_URL) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database configuration is missing',
    });
  }
  return drizzle(neon(process.env.DATABASE_URL), { schema });
}

// Initialize database connection lazily
let dbInstance: DrizzleDB | null = null;

function getDB(): DrizzleDB {
  // During SSG/ISR build, database operations are not needed
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Database operations are not available during build time',
    });
  }

  if (!dbInstance) {
    dbInstance = createDrizzleInstance();
  }

  return dbInstance;
}

export interface Context {
  db: DrizzleDB;
  ip: string;
}

export const createContext = async (opts?: FetchCreateContextFnOptions): Promise<Context> => {
  // Get IP from request headers or fallback to localhost
  const ip = opts?.req.headers.get('x-forwarded-for') ?? 
             opts?.req.headers.get('x-real-ip') ?? 
             '127.0.0.1';

  return {
    db: getDB(),
    ip: typeof ip === 'string' ? ip : '127.0.0.1',
  };
}; 