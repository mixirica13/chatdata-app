import { redis } from '../config/redis.js';
import { logger } from './logger.js';
import { cacheHitCounter, cacheMissCounter } from './metrics.js';

/**
 * Helper para buscar do cache ou executar função
 */
export async function withCache<T>(
  cacheKey: string,
  ttl: number,
  fetchFn: () => Promise<T>,
  toolName?: string
): Promise<{ data: T; cached: boolean; cache_ttl: number }> {
  try {
    // Tentar buscar do cache
    const cached = await redis.get(cacheKey);

    if (cached) {
      logger.debug('Cache hit', { key: cacheKey });
      if (toolName) {
        cacheHitCounter.inc({ tool: toolName });
      }
      return {
        data: JSON.parse(cached),
        cached: true,
        cache_ttl: ttl,
      };
    }

    logger.debug('Cache miss', { key: cacheKey });
    if (toolName) {
      cacheMissCounter.inc({ tool: toolName });
    }

    // Executar função
    const data = await fetchFn();

    // Salvar no cache
    await redis.setex(cacheKey, ttl, JSON.stringify(data));
    logger.debug('Data cached', { key: cacheKey, ttl });

    return {
      data,
      cached: false,
      cache_ttl: ttl,
    };
  } catch (error) {
    logger.error('Cache error', { error, key: cacheKey });
    // Se o cache falhar, executar a função mesmo assim
    const data = await fetchFn();
    return {
      data,
      cached: false,
      cache_ttl: ttl,
    };
  }
}

/**
 * Invalidar cache de um usuário
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  try {
    const pattern = `*:${userId}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info('User cache invalidated', { userId, keysDeleted: keys.length });
    }
  } catch (error) {
    logger.error('Error invalidating user cache', { error, userId });
  }
}

/**
 * Invalidar cache por padrão
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info('Cache pattern invalidated', { pattern, keysDeleted: keys.length });
    }
  } catch (error) {
    logger.error('Error invalidating cache pattern', { error, pattern });
  }
}

export default { withCache, invalidateUserCache, invalidateCachePattern };
