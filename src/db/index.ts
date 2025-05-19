import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// During build time, don't initialize the database
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined';

// Only check for DATABASE_URL when we're actually going to use it
if (!isBuildTime && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a type for our database
type DB = ReturnType<typeof drizzle<typeof schema>>;

// Skip database initialization during build time
export const db = isBuildTime ? 
  {} as DB : // During build time, return empty object with DB type
  drizzle(neon(process.env.DATABASE_URL!), { schema }); 