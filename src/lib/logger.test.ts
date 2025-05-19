import { Logger } from './logger';
import pino from 'pino';

jest.mock('pino', () => {
  const mockPino = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  return jest.fn(() => mockPino);
});

describe('Logger', () => {
  let logger: Logger;
  let mockPinoLogger: ReturnType<typeof pino>;

  beforeEach(() => {
    // Reset the singleton instance before each test
    // @ts-ignore - accessing private property for testing
    Logger.instance = undefined;
    logger = Logger.getInstance();
    mockPinoLogger = (pino as jest.Mock)();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('info', () => {
    it('should call pino info with message', () => {
      logger.info('Test message');
      expect(mockPinoLogger.info).toHaveBeenCalledWith({}, 'Test message');
    });

    it('should call pino info with message and object', () => {
      const obj = { key: 'value' };
      logger.info('Test message', obj);
      expect(mockPinoLogger.info).toHaveBeenCalledWith(obj, 'Test message');
    });
  });

  describe('error', () => {
    it('should call pino error with Error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        {
          err: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        'Error occurred'
      );
    });

    it('should call pino error with non-Error object', () => {
      const error = { custom: 'error' };
      logger.error('Error occurred', error);
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { err: error },
        'Error occurred'
      );
    });
  });

  describe('warn', () => {
    it('should call pino warn with message', () => {
      logger.warn('Warning message');
      expect(mockPinoLogger.warn).toHaveBeenCalledWith({}, 'Warning message');
    });

    it('should call pino warn with message and object', () => {
      const obj = { key: 'value' };
      logger.warn('Warning message', obj);
      expect(mockPinoLogger.warn).toHaveBeenCalledWith(obj, 'Warning message');
    });
  });

  describe('debug', () => {
    it('should call pino debug with message', () => {
      logger.debug('Debug message');
      expect(mockPinoLogger.debug).toHaveBeenCalledWith({}, 'Debug message');
    });

    it('should call pino debug with message and object', () => {
      const obj = { key: 'value' };
      logger.debug('Debug message', obj);
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(obj, 'Debug message');
    });
  });
}); 