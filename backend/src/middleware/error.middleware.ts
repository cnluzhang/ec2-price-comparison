import { Request, Response, NextFunction } from 'express';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string
  ) {
    super(message);
  }
}

/**
 * Global error handling middleware
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error caught by middleware:', err);
  
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
