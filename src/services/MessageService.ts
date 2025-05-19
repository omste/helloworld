import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/routers/_app';

export interface Message {
  content: string;
}

export interface DatabaseMessage {
  id: number;
  themessage: string;
}

export class MessageService {
  private static instance: MessageService;
  private trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  private constructor() {
    this.trpc = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    });
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public async getWelcomeMessage(): Promise<Message> {
    const result = await this.trpc.greeting.query();
    return {
      content: result.text
    };
  }

  public async addMessage(text: string): Promise<void> {
    await this.trpc.addMessage.mutate({ text });
  }

  public async getMessages(): Promise<DatabaseMessage[]> {
    return await this.trpc.getMessages.query();
  }

  // Extensible for future features like:
  // - Loading messages from CMS
  // - Handling translations
  // - A/B testing different messages
  // - Loading messages based on time of day, etc.
} 