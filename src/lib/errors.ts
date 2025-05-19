export class AppError extends Error {
  constructor(message: string, public code: string = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ServiceError extends AppError {
  constructor(message: string) {
    super(message, 'SERVICE_ERROR');
    this.name = 'ServiceError';
  }
} 