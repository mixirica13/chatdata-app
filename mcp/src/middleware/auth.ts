import { Request, Response, NextFunction } from 'express';
import { tokenManager } from '../services/tokenManager.js';
import { logger } from '../utils/logger.js';
import { ErrorCode } from '../types/index.js';

/**
 * Middleware de autenticação MCP Token
 */
export async function authenticateMCPToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header', {
        ip: req.ip,
        path: req.path,
      });

      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
        code: ErrorCode.UNAUTHORIZED,
      });
    }

    const mcpToken = authHeader.substring(7); // Remove "Bearer "

    // Buscar token no banco de dados
    const userToken = await tokenManager.findByMCPToken(mcpToken);

    if (!userToken) {
      logger.warn('Invalid MCP token', {
        ip: req.ip,
        path: req.path,
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid MCP token',
        code: ErrorCode.INVALID_TOKEN,
      });
    }

    // Verificar se o token do Meta está expirado
    const now = new Date();
    const expiresAt = new Date(userToken.meta_token_expires_at);

    if (now >= expiresAt) {
      logger.info('Meta token expired, attempting renewal', {
        userId: userToken.user_id,
      });

      // Tentar renovar token do Meta
      const renewed = await tokenManager.renewMetaToken(userToken);

      if (!renewed) {
        logger.error('Meta token expired and renewal failed', {
          userId: userToken.user_id,
        });

        return res.status(401).json({
          success: false,
          error: 'Meta token expired and renewal failed. Please reconnect your Meta account.',
          code: ErrorCode.TOKEN_EXPIRED,
        });
      }

      // Atualizar o token no objeto
      userToken.meta_access_token = renewed.access_token;
      userToken.meta_token_expires_at = renewed.expires_at;
    }

    // Anexar usuário à requisição
    req.user = userToken;

    logger.debug('Authentication successful', {
      userId: userToken.user_id,
      metaUserId: userToken.meta_user_id,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: ErrorCode.SERVER_ERROR,
    });
  }
}

export default authenticateMCPToken;
