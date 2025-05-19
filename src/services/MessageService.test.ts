import { MessageService } from './MessageService';

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    // Reset the singleton instance before each test
    // @ts-expect-error - accessing private property for testing
    MessageService.instance = undefined;
    messageService = MessageService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = MessageService.getInstance();
      const instance2 = MessageService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getWelcomeMessage', () => {
    it('should return the welcome message', () => {
      const message = messageService.getWelcomeMessage();
      expect(message).toEqual({
        content: 'Hello, world!'
      });
    });
  });
}); 