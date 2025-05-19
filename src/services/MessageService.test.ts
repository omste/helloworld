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

  beforeEach(() => {
    // Reset the singleton instance before each test
    // @ts-expect-error - accessing private property for testing
    MessageService.instance = undefined;
    messageService = MessageService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = MessageService.getInstance();
      const instance2 = MessageService.getInstance();
      expect(instance1).toBe(instance2);
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

    it('should handle tRPC errors', async () => {
      const error = new Error('tRPC error');
      // @ts-expect-error - accessing mocked property
      messageService.trpc.greeting.query.mockRejectedValue(error);

      await expect(messageService.getWelcomeMessage()).rejects.toThrow('tRPC error');
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

    it('should handle tRPC errors', async () => {
      const error = new Error('tRPC error');
      // @ts-expect-error - accessing mocked property
      messageService.trpc.getMessages.query.mockRejectedValue(error);

      await expect(messageService.getMessages()).rejects.toThrow('tRPC error');
    });
  });
}); 