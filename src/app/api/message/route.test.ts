import { GET } from './route';
import { MessageService } from '@/services/MessageService';
import { AppError } from '@/lib/errors';
import { Logger } from '@/lib/logger';
import type { Message } from '@/services/MessageService';

// Mock dependencies
jest.mock('@/services/MessageService');
jest.mock('@/lib/logger', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  return {
    Logger: {
      getInstance: jest.fn(() => mockLogger),
    },
  };
});

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => {
      return {
        status: init?.status || 200,
        json: async () => data,
      };
    }),
  },
}));

describe('Message API Route', () => {
  let mockGetWelcomeMessage: jest.Mock<Message>;
  let mockLogger: ReturnType<typeof Logger.getInstance>;

  beforeEach(() => {
    // Setup MessageService mocks
    mockGetWelcomeMessage = jest.fn();
    jest.spyOn(MessageService, 'getInstance').mockReturnValue({
      getWelcomeMessage: mockGetWelcomeMessage
    } as MessageService);

    // Get the mocked logger instance
    mockLogger = Logger.getInstance();
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
    expect(mockLogger.info).toHaveBeenCalledWith('Fetching welcome message');
    expect(mockLogger.info).toHaveBeenCalledWith('Welcome message fetched successfully', { message: mockMessage });
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
    expect(mockLogger.error).toHaveBeenCalledWith('Error fetching welcome message', error);
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
    expect(mockLogger.error).toHaveBeenCalledWith('Error fetching welcome message', error);
  });

  it('should handle null/undefined errors', async () => {
    mockGetWelcomeMessage.mockImplementation(() => {
      throw null;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch welcome message' });
    expect(mockLogger.error).toHaveBeenCalledWith('Error fetching welcome message', null);
  });
}); 