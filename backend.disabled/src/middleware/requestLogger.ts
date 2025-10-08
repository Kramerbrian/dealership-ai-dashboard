import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  if (config.logging.enableConsole) {
    console.log(`${req.method} ${req.url} - ${req.ip} - ${req.get('User-Agent')}`);
  }
  
  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, callback?: any): any {
    const duration = Date.now() - start;

    if (config.logging.enableConsole) {
      console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    }

    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = undefined;
    }

    return originalEnd(chunk, encoding, callback);
  } as any;
  
  next();
};
