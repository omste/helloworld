import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

const handler = (req: Request) => {
  console.log('tRPC API Request:', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries())
  });

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async (opts) => {
      console.log('Creating tRPC context');
      const ctx = await createContext(opts);
      console.log('tRPC context created:', { ip: ctx.ip });
      return ctx;
    },
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `tRPC failed on ${path ?? '<no-path>'}:`,
              error
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST }; 