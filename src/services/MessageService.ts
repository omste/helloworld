import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/routers/_app';
import { type Message, type MessageResponse, type MessageInput } from '@/lib/schemas';

export type { Message, MessageResponse, MessageInput };

export interface DatabaseMessage {
  id: number;
  themessage: string;
}

export class MessageService {
  private static instance: MessageService;
  private trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  private constructor() {
    const getBaseUrl = () => {
      if (typeof window !== 'undefined') return '';
      
      if (process.env.K_SERVICE) {
        const region = process.env.CLOUD_RUN_REGION || 'us-central1';
        const projectId = process.env.GCP_PROJECT_ID;
        return `https://${process.env.K_SERVICE}-${projectId}.${region}.run.app`;
      }
      
      return `http://localhost:${process.env.PORT ?? 3000}`;
    };

    this.trpc = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
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

  public async getWelcomeMessage(): Promise<MessageResponse> {
    console.log('📤 Calling tRPC greeting procedure...');
    const result = await this.trpc.greeting.query();
    console.log('📥 tRPC response:', result);
    return {
      text: result.text
    };
  }

  public async addMessage(text: string): Promise<void> {
    await this.trpc.addMessage.mutate({ text });
  }

  public async getMessages(): Promise<Message[]> {
    return await this.trpc.getMessages.query();
  }

  // Extensible for future features like:
  // - Loading messages from CMS
  // - Handling translations
  // - A/B testing different messages
  // - Loading messages based on time of day, etc.
} 