const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Handles all errors that occur in the application
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user ? req.user.id : null,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'Something went wrong';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Invalid input data';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Authentication required';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
    message = 'Access denied';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = 'Resource not found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = 'Resource conflict';
  } else if (err.name === 'RateLimitError') {
    statusCode = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  }

  // Development vs Production error details
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    error: {
      code: errorCode,
      message: message,
      ...(isDevelopment && {
        details: err.message,
        stack: err.stack
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(isDevelopment && {
      userId: req.user ? req.user.id : null,
      ip: req.ip
    })
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler middleware
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error('Route not found');
  error.name = 'NotFoundError';
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch rejected promises
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for consistent error handling
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

/**
 * Helper function to create and throw custom errors
 */
const createError = (message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR') => {
  const error = new AppError(message, statusCode, errorCode);
  return error;
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  createError
};