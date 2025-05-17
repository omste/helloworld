import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
import { setupTelemetry } from '@/lib/telemetry';

// Initialize OpenTelemetry
if (process.env.NODE_ENV === 'production') {
  setupTelemetry();
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST }; 