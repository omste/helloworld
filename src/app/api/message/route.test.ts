import { GET } from './route';
import { MessageService } from '@/services/MessageService';
import { AppError } from '@/lib/errors';
import { Logger } from '@/lib/logger';
import type { Message } from '@/services/MessageService';

// Mock dependencies
jest.mock('@/services/MessageService');
jest.mock('@/lib/logger');

describe('Message API Route', () => {
  let mockGetWelcomeMessage: jest.Mock<Message>;
  let mockLoggerInfo: jest.Mock;
  let mockLoggerError: jest.Mock;
  let mockLoggerWarn: jest.Mock;
  let mockLoggerDebug: jest.Mock;

  beforeEach(() => {
    // Setup MessageService mocks
    mockGetWelcomeMessage = jest.fn();
    jest.spyOn(MessageService, 'getInstance').mockReturnValue({
      getWelcomeMessage: mockGetWelcomeMessage
    } as MessageService);

    // Setup Logger mocks
    mockLoggerInfo = jest.fn();
    mockLoggerError = jest.fn();
    mockLoggerWarn = jest.fn();
    mockLoggerDebug = jest.fn();
    const mockLogger = {
      info: mockLoggerInfo,
      error: mockLoggerError,
      warn: mockLoggerWarn,
      debug: mockLoggerDebug,
    };
    jest.spyOn(Logger, 'getInstance').mockReturnValue(mockLogger as unknown as Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return welcome message successfully', async () => {
    const mockMessage = { content: 'Test message' };
    mockGetWelcomeMessage.mockReturnValue(mockMessage);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockMessage);
    expect(mockLoggerInfo).toHaveBeenCalledWith('Fetching welcome message');
    expect(mockLoggerInfo).toHaveBeenCalledWith('Welcome message fetched successfully', { message: mockMessage });
  });

  it('should handle AppError correctly', async () => {
    const error = new AppError('Custom error', '418');
    mockGetWelcomeMessage.mockImplementation(() => {
      throw error;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(418);
    expect(data).toEqual({ error: 'Custom error' });
    expect(mockLoggerError).toHaveBeenCalledWith('Error fetching welcome message', error);
  });

  it('should handle unknown errors as ServiceError', async () => {
    const error = new Error('Unknown error');
    mockGetWelcomeMessage.mockImplementation(() => {
      throw error;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch welcome message' });
    expect(mockLoggerError).toHaveBeenCalledWith('Error fetching welcome message', error);
  });

  it('should handle null/undefined errors', async () => {
    mockGetWelcomeMessage.mockImplementation(() => {
      throw null;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch welcome message' });
    expect(mockLoggerError).toHaveBeenCalledWith('Error fetching welcome message', null);
  });
}); 