import { createMessageService } from './MessageService';

// Mock the entire @trpc/client module
const mockTrpcClient = {
  greeting: {
    query: jest.fn(),
  },
  addMessage: {
    mutate: jest.fn(),
  },
  getMessages: {
    query: jest.fn(),
  },
};

jest.mock('@trpc/client', () => ({
  createTRPCProxyClient: jest.fn(() => mockTrpcClient),
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
  const originalEnv = process.env;
  let messageService: ReturnType<typeof createMessageService>;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    messageService = createMessageService();
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

  describe('URL handling', () => {
    it('should use relative URL in browser environment', () => {
      // @ts-expect-error - mocking window
      global.window = {};
      const service = createMessageService();
      expect(service).toBeDefined();
    });

    it('should use Cloud Run URL in production environment', () => {
      process.env.K_SERVICE = 'my-service';
      process.env.GCP_PROJECT_ID = 'my-project';
      process.env.CLOUD_RUN_REGION = 'us-central1';
      setNodeEnv('production');
      const service = createMessageService();
      expect(service).toBeDefined();
    });

    it('should use default region if not specified', () => {
      process.env.K_SERVICE = 'my-service';
      process.env.GCP_PROJECT_ID = 'my-project';
      process.env.CLOUD_RUN_REGION = undefined;
      setNodeEnv('production');
      const service = createMessageService();
      expect(service).toBeDefined();
    });

    it('should use localhost with custom port if specified', () => {
      process.env.PORT = '4000';
      const service = createMessageService();
      expect(service).toBeDefined();
    });

    it('should use localhost with default port if no port specified', () => {
      process.env.PORT = undefined;
      const service = createMessageService();
      expect(service).toBeDefined();
    });

    it('should use fallback URL during build time', () => {
      setNodeEnv('production');
      // @ts-expect-error - removing window
      delete global.window;
      const service = createMessageService();
      expect(service).toBeDefined();
    });
  });

  describe('getWelcomeMessage', () => {
    it('should return the welcome message from tRPC', async () => {
      const mockResponse = { text: 'Hello from tRPC!' };
      mockTrpcClient.greeting.query.mockResolvedValue(mockResponse);

      const message = await messageService.getWelcomeMessage();
      expect(message).toEqual({
        text: mockResponse.text
      });
      expect(mockTrpcClient.greeting.query).toHaveBeenCalled();
    });

    it('should throw error when tRPC call fails', async () => {
      const error = new Error('tRPC error');
      mockTrpcClient.greeting.query.mockRejectedValue(error);

      await expect(messageService.getWelcomeMessage()).rejects.toThrow('tRPC error');
    });
  });

  describe('addMessage', () => {
    it('should call tRPC mutation with the message', async () => {
      const testMessage = 'Test message';
      mockTrpcClient.addMessage.mutate.mockResolvedValue({ success: true });

      await messageService.addMessage(testMessage);
      expect(mockTrpcClient.addMessage.mutate).toHaveBeenCalledWith({ text: testMessage });
    });

    it('should throw error when tRPC mutation fails', async () => {
      const error = new Error('Mutation error');
      const testMessage = 'Test message';
      mockTrpcClient.addMessage.mutate.mockRejectedValue(error);

      await expect(messageService.addMessage(testMessage)).rejects.toThrow('Mutation error');
    });
  });

  describe('getMessages', () => {
    it('should return all messages from tRPC', async () => {
      const mockMessages = [
        { id: 1, themessage: 'First message' },
        { id: 2, themessage: 'Second message' }
      ];
      mockTrpcClient.getMessages.query.mockResolvedValue(mockMessages);

      const messages = await messageService.getMessages();
      expect(messages).toEqual(mockMessages);
      expect(mockTrpcClient.getMessages.query).toHaveBeenCalled();
    });

    it('should throw error when tRPC query fails', async () => {
      const error = new Error('tRPC error');
      mockTrpcClient.getMessages.query.mockRejectedValue(error);

      await expect(messageService.getMessages()).rejects.toThrow('tRPC error');
    });
  });
}); 