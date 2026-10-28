import { Request, Response, NextFunction } from 'express';
import { generateCorrelationId } from '../utils/security.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const correlationId = (req as any).correlationId || generateCorrelationId();
  console.error(`[Error] [${correlationId}]`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    correlationId,
    timestamp: new Date().toISOString(),
  });
}

