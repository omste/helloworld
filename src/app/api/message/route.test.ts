import { GET } from './route';
import { MessageService } from '@/services/MessageService';
import { AppError, ServiceError } from '@/lib/errors';
import { Logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/services/MessageService');
jest.mock('@/lib/logger');

describe('Message API Route', () => {
  let mockGetInstance: jest.SpyInstance;
  let mockGetWelcomeMessage: jest.Mock;
  let mockLoggerGetInstance: jest.SpyInstance;
  let mockLoggerInfo: jest.Mock;
  let mockLoggerError: jest.Mock;

  beforeEach(() => {
    // Setup MessageService mocks
    mockGetWelcomeMessage = jest.fn();
    mockGetInstance = jest.spyOn(MessageService, 'getInstance').mockReturnValue({
      getWelcomeMessage: mockGetWelcomeMessage
    } as any);

    // Setup Logger mocks
    mockLoggerInfo = jest.fn();
    mockLoggerError = jest.fn();
    mockLoggerGetInstance = jest.spyOn(Logger, 'getInstance').mockReturnValue({
      info: mockLoggerInfo,
      error: mockLoggerError
    } as any);
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
    const error = new AppError('Custom error', 418);
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