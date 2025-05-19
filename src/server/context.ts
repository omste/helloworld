import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { TRPCError } from '@trpc/server';

// Create a type for our database instance
type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

// Initialize database connection lazily
let dbInstance: DrizzleDB | null = null;

function getDB(): DrizzleDB {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ Database URL is missing');
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database configuration is missing',
      });
    }

    if (!dbInstance) {
      console.log('📦 Creating new database instance...');
      dbInstance = drizzle(neon(process.env.DATABASE_URL), { schema });
      console.log('✅ Database instance created');
    }

    return dbInstance;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to initialize database connection',
      cause: error,
    });
  }
}

export interface Context {
  db: DrizzleDB;
  ip: string;
}

export const createContext = async (opts?: FetchCreateContextFnOptions): Promise<Context> => {
  try {
    const ip = opts?.req.headers.get('x-forwarded-for') ?? 
               opts?.req.headers.get('x-real-ip') ?? 
               '127.0.0.1';

    console.log('🔄 Creating context with IP:', ip);
    const db = getDB();
    console.log('✅ Context created successfully');

    return {
      db,
      ip: typeof ip === 'string' ? ip : '127.0.0.1',
    };
  } catch (error) {
    console.error('❌ Failed to create context:', error);
    throw error; // Re-throw to be handled by tRPC error formatter
  }
}; 