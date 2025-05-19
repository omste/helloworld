import { MessageService } from './MessageService';

// Mock the entire @trpc/client module
jest.mock('@trpc/client', () => ({
  createTRPCProxyClient: jest.fn(() => ({
    greeting: {
      query: jest.fn(),
    },
    addMessage: {
      mutate: jest.fn(),
    },
    getMessages: {
      query: jest.fn(),
    },
  })),
  httpBatchLink: jest.fn(),
}));

// Mock superjson
jest.mock('superjson', () => ({
  default: {
    parse: jest.fn(),
    stringify: jest.fn(),
  },
}));

describe('MessageService', () => {
  let messageService: MessageService;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset the singleton instance before each test
    // @ts-expect-error - accessing private property for testing
    MessageService.instance = undefined;
    // Reset process.env before each test
    process.env = { ...originalEnv };
    messageService = MessageService.getInstance();
    // Spy on console.error to prevent actual logging during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
    // @ts-expect-error - accessing private property for testing
    delete global.window;
  });

  const setNodeEnv = (value: string) => {
    Object.defineProperty(process.env, 'NODE_ENV', { value, configurable: true });
  };

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = MessageService.getInstance();
      const instance2 = MessageService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('URL handling', () => {
    it('should use relative URL in browser environment', () => {
      // @ts-expect-error - mocking window
      global.window = {};
      const newInstance = MessageService.getInstance();
      expect(newInstance).toBeDefined();
    });

    it('should use Cloud Run URL in production environment', () => {
      process.env.K_SERVICE = 'my-service';
      process.env.GCP_PROJECT_ID = 'my-project';
      process.env.CLOUD_RUN_REGION = 'us-central1';
      setNodeEnv('production');
      const newInstance = MessageService.getInstance();
      expect(newInstance).toBeDefined();
    });

    it('should use default region if not specified', () => {
      process.env.K_SERVICE = 'my-service';
      process.env.GCP_PROJECT_ID = 'my-project';
      process.env.CLOUD_RUN_REGION = undefined;
      setNodeEnv('production');
      const newInstance = MessageService.getInstance();
      expect(newInstance).toBeDefined();
    });

    it('should use localhost with custom port if specified', () => {
      process.env.PORT = '4000';
      const newInstance = MessageService.getInstance();
      expect(newInstance).toBeDefined();
    });

    it('should use localhost with default port if no port specified', () => {
      process.env.PORT = undefined;
      const newInstance = MessageService.getInstance();
      expect(newInstance).toBeDefined();
    });

    it('should use fallback URL during build time', () => {
      setNodeEnv('production');
      // @ts-expect-error - removing window
      delete global.window;
      const newInstance = MessageService.getInstance();
      expect(newInstance).toBeDefined();
    });
  });

  describe('getWelcomeMessage', () => {
    it('should return the welcome message from tRPC', async () => {
      const mockResponse = { text: 'Hello from tRPC!' };
      // @ts-expect-error - accessing mocked property
      messageService.trpc.greeting.query.mockResolvedValue(mockResponse);

      const message = await messageService.getWelcomeMessage();
      expect(message).toEqual({
        content: mockResponse.text
      });
      // @ts-expect-error - accessing mocked property
      expect(messageService.trpc.greeting.query).toHaveBeenCalled();
    });

    it('should return fallback message on tRPC errors', async () => {
      const error = new Error('tRPC error');
      // @ts-expect-error - accessing mocked property
      messageService.trpc.greeting.query.mockRejectedValue(error);

      const message = await messageService.getWelcomeMessage();
      expect(message).toEqual({
        content: 'Welcome to our application!'
      });
      expect(console.error).toHaveBeenCalledWith('Failed to get welcome message:', error);
    });

    it('should return fallback message during build time', async () => {
      setNodeEnv('production');
      // @ts-expect-error - removing window
      delete global.window;
      
      const message = await messageService.getWelcomeMessage();
      expect(message).toEqual({
        content: 'Welcome to our application!'
      });
      // @ts-expect-error - accessing mocked property
      expect(messageService.trpc.greeting.query).not.toHaveBeenCalled();
    });
  });

  describe('addMessage', () => {
    it('should call tRPC mutation with the message', async () => {
      const testMessage = 'Test message';
      // @ts-expect-error - accessing mocked property
      messageService.trpc.addMessage.mutate.mockResolvedValue({ success: true });

      await messageService.addMessage(testMessage);
      // @ts-expect-error - accessing mocked property
      expect(messageService.trpc.addMessage.mutate).toHaveBeenCalledWith({ text: testMessage });
    });

    it('should handle tRPC mutation errors', async () => {
      const error = new Error('Mutation error');
      const testMessage = 'Test message';
      // @ts-expect-error - accessing mocked property
      messageService.trpc.addMessage.mutate.mockRejectedValue(error);

      await expect(messageService.addMessage(testMessage)).rejects.toThrow('Mutation error');
    });
  });

  describe('getMessages', () => {
    it('should return all messages from tRPC', async () => {
      const mockMessages = [
        { id: 1, themessage: 'First message' },
        { id: 2, themessage: 'Second message' }
      ];
      // @ts-expect-error - accessing mocked property
      messageService.trpc.getMessages.query.mockResolvedValue(mockMessages);

      const messages = await messageService.getMessages();
      expect(messages).toEqual(mockMessages);
      // @ts-expect-error - accessing mocked property
      expect(messageService.trpc.getMessages.query).toHaveBeenCalled();
    });

    it('should return empty array on tRPC errors', async () => {
      const error = new Error('tRPC error');
      // @ts-expect-error - accessing mocked property
      messageService.trpc.getMessages.query.mockRejectedValue(error);

      const messages = await messageService.getMessages();
      expect(messages).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Failed to get messages:', error);
    });

    it('should return empty array during build time', async () => {
      setNodeEnv('production');
      // @ts-expect-error - removing window
      delete global.window;
      
      const messages = await messageService.getMessages();
      expect(messages).toEqual([]);
      // @ts-expect-error - accessing mocked property
      expect(messageService.trpc.getMessages.query).not.toHaveBeenCalled();
    });
  });
}); 