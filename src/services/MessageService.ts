import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/routers/_app';
import type { Message, MessageResponse, MessageInput } from '@/lib/schemas';

export type { Message, MessageResponse, MessageInput };

export interface DatabaseMessage {
  id: number;
  themessage: string;
}

// --- Helper: Determine base URL depending on environment ---
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') return '';

  if (process.env.K_SERVICE) {
    return process.env.K_SERVICE_URL || 'http://localhost:3000';
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
};

// --- Helper: Detect build-time ---
const isBuildTime = (): boolean =>
  process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'build';

// --- Create tRPC client ---
const createTrpcClient = () => createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        console.log('tRPC URL:', `${getBaseUrl()}/api/trpc`);
        return {};
      },
    }),
  ],
});

// --- Factory to create message service ---
export const createMessageService = () => {
  const trpc = createTrpcClient();

  const getWelcomeMessage = async (): Promise<MessageResponse> => {
    if (isBuildTime()) {
      console.log('Build time detected, skipping tRPC request');
      return { text: 'Loading...' };
    }

    console.log('Calling tRPC greeting procedure...');
    const result = await trpc.greeting.query();
    console.log('tRPC response:', result);
    return { text: result.text };
  };

  const addMessage = async (text: string): Promise<void> => {
    if (isBuildTime()) {
      console.log('Build time detected, skipping tRPC mutation');
      return;
    }
    await trpc.addMessage.mutate({ text });
  };

  const getMessages = async (): Promise<Message[]> => {
    if (isBuildTime()) {
      console.log('Build time detected, skipping tRPC query');
      return [];
    }
    return await trpc.getMessages.query();
  };

  return {
    getWelcomeMessage,
    addMessage,
    getMessages,
  };
};

// Extensible for future features like:
// - Loading messages from CMS
// - Handling translations
// - A/B testing different messages
// - Loading messages based on time of day, etc. 