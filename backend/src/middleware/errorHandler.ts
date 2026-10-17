import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    error = createError(`An account with this ${field} already exists`, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error = createError(message, 400);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = createError('Resource not found', 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = createError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = createError('Your token has expired. Please log in again.', 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  if (statusCode >= 500) logger.error(err.stack || message);
  
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};
