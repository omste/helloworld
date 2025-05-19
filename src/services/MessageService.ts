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
    const getBaseUrl = () => {
      // Browser should use relative URL
      if (typeof window !== 'undefined') {
        return '';
      }

      // Server-side runtime should use environment variables
      // For Cloud Run, we can use K_SERVICE and other environment variables
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