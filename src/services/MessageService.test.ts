import { MessageService } from './MessageService';

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    // Reset the singleton instance before each test
    // @ts-ignore - accessing private property for testing
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

  // Example of how we could test future features
  describe('future features - demonstration purposes', () => {
    it('could handle different languages', () => {
      type SupportedLanguages = 'en' | 'es';
      const mockTranslations: Record<SupportedLanguages, string> = {
        'en': 'Welcome to our beautiful cherry blossom world',
        'es': 'Bienvenido a nuestro hermoso mundo de flores de cerezo'
      };
      
      // Example of how we might mock an internal translation service
      jest.spyOn(messageService as any, 'getTranslation')
        .mockImplementation(function(this: unknown, ...args: unknown[]) {
          const [, lang] = args;
          return mockTranslations[lang as SupportedLanguages];
        });
    });

    it('could handle time-based messages', () => {
      // Example of mocking time-based functionality
      const mockDate = new Date('2024-03-21T12:00:00');
      jest.spyOn(global, 'Date')
        .mockImplementation(() => mockDate as unknown as Date);
    });
  });
}); 