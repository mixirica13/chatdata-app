import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis.js';
import { config } from '../config/env.js';
import { ErrorCode } from '../types/index.js';

/**
 * Rate limiter para proteger a API (por IP)
 */
export const apiLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error - RedisStore types are not fully compatible
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rate_limit:',
  }),
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health and metrics endpoints
    return req.path === '/health' || req.path === '/metrics';
  },
});

/**
 * Rate limiter por usuário (MCP token)
 */
export const userLimiter = rateLimit({
  store: new RedisStore({
    // @ts-expect-error - RedisStore types are not fully compatible
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'user_rate_limit:',
  }),
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.userMaxRequests,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip || 'unknown';
  },
  message: {
    success: false,
    error: 'User rate limit exceeded, please try again later',
    code: ErrorCode.USER_RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default { apiLimiter, userLimiter };
