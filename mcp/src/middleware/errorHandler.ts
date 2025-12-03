import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { ErrorCode, APIError } from '../types/index.js';

/**
 * Error handler middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error handler caught error', {
    error: err,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Erro de validação Zod
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      code: ErrorCode.VALIDATION_ERROR,
      details: err.errors,
    } as APIError);
  }

  // Erro de rate limit da Meta
  if (err.message === 'META_RATE_LIMIT') {
    return res.status(429).json({
      success: false,
      error: 'Meta API rate limit exceeded. Please try again later.',
      code: ErrorCode.META_RATE_LIMIT,
    } as APIError);
  }

  // Erro de permissão da Meta
  if (err.message === 'META_PERMISSION_DENIED') {
    return res.status(403).json({
      success: false,
      error: 'Permission denied to access Meta API. Please check your permissions.',
      code: ErrorCode.META_PERMISSION_DENIED,
    } as APIError);
  }

  // Erro de tool inválida
  if (err.message?.includes('Tool') && err.message?.includes('not found')) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: ErrorCode.INVALID_TOOL,
      available_tools: [
        'list_ad_accounts',
        'list_campaigns',
        'get_campaign_insights',
        'get_account_insights',
        'search_campaigns',
      ],
    } as APIError);
  }

  // Erro genérico
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    code: ErrorCode.SERVER_ERROR,
  } as APIError);
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.warn('404 Not Found', {
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
  });
}

export default { errorHandler, notFoundHandler };
