import { createMessageService } from '@/services/MessageService';
import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { AppError, ServiceError } from '@/lib/errors';

const logger = Logger.getInstance();

export async function GET() {
  try {
    logger.info('Fetching welcome message');
    
    const messageService = createMessageService();
    const message = await messageService.getWelcomeMessage();
    
    logger.info('Welcome message fetched successfully', { message });
    return NextResponse.json(message);
  } catch (error) {
    logger.error('Error fetching welcome message', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    const serviceError = new ServiceError('Failed to fetch welcome message');
    return NextResponse.json(
      { error: serviceError.message },
      { status: serviceError.statusCode }
    );
  }
} 