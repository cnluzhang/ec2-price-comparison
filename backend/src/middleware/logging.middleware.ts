import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 */
export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;
  
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - Request received from ${ip}`);
  
  // Add response finish listener
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - Response sent with status ${statusCode} in ${duration}ms`);
  });
  
  next();
};
