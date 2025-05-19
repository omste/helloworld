import { AppError, NotFoundError, ValidationError, ServiceError } from './errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with default values', () => {
      const error = new AppError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it('should create an error with custom values', () => {
      const error = new AppError('Custom error', 418, false);
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(418);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('NotFoundError', () => {
    it('should create a 404 error with default message', () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should create a 404 error with custom message', () => {
      const error = new NotFoundError('Custom not found message');
      expect(error.message).toBe('Custom not found message');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ValidationError', () => {
    it('should create a 400 error with default message', () => {
      const error = new ValidationError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create a 400 error with custom message', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('ServiceError', () => {
    it('should create a 500 error with default message', () => {
      const error = new ServiceError();
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Service error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create a 500 error with custom message', () => {
      const error = new ServiceError('Database connection failed');
      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
    });
  });
}); 