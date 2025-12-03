import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { TokenValidation } from '../types/mcp.js';

/**
 * Valida o token Meta Access Token via query parameter
 * O token é passado diretamente na URL: ?token=EAAB...
 */
export async function validateMetaToken(
  token: string
): Promise<TokenValidation> {
  try {
    // Verificar se o token existe e é válido
    if (!token || token.trim() === '') {
      return {
        valid: false,
        error: 'Token is required in query parameter: ?token=YOUR_META_ACCESS_TOKEN',
      };
    }

    // Validar token com Meta Graph API (buscar info do usuário)
    const meResponse = await fetch(
      `https://graph.facebook.com/v21.0/me?access_token=${token}&fields=id,name`
    );

    if (!meResponse.ok) {
      const error = await meResponse.json();
      logger.error('Meta token validation failed', { error });

      return {
        valid: false,
        error: `Invalid Meta access token: ${error.error?.message || 'Token validation failed'}`,
      };
    }

    const userData = await meResponse.json();

    // Buscar contas de anúncios do usuário
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/adaccounts?access_token=${token}&fields=id`
    );

    let ad_account_ids: string[] = [];

    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      ad_account_ids = accountsData.data?.map((acc: any) => acc.id) || [];
    }

    logger.info('Meta token validated', {
      meta_user_id: userData.id,
      meta_user_name: userData.name,
      ad_accounts_count: ad_account_ids.length,
    });

    return {
      valid: true,
      access_token: token,
      user_id: userData.id,
      ad_account_ids,
    };
  } catch (error: any) {
    logger.error('Error validating Meta token', { error });

    return {
      valid: false,
      error: `Token validation error: ${error.message}`,
    };
  }
}

/**
 * Middleware de autenticação MCP via query parameter
 * Extrai o token da URL (?token=...) e valida com Meta API
 */
export async function authenticateMCPRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extrair token do query parameter
    const token = req.query.token as string;

    if (!token) {
      logger.warn('Missing token in query parameter', {
        ip: req.ip,
        path: req.path,
        query: req.query,
      });

      return res.status(401).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32000,
          message: 'Unauthorized: Missing token in query parameter',
          data: {
            hint: 'Add ?token=YOUR_META_ACCESS_TOKEN to the URL',
            example: 'https://mcp.chatdata.pro/meta-ads-mcp?token=EAABw...',
          },
        },
      });
    }

    // Validar token com Meta API
    const validation = await validateMetaToken(token);

    if (!validation.valid) {
      logger.warn('Invalid Meta token', {
        ip: req.ip,
        error: validation.error,
      });

      return res.status(401).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32000,
          message: 'Unauthorized: Invalid Meta access token',
          data: {
            error: validation.error,
            hint: 'Ensure you are using a valid Meta Ads API access token',
          },
        },
      });
    }

    // Anexar informações do token validado à requisição
    req.metaToken = {
      access_token: validation.access_token!,
      user_id: validation.user_id!,
      ad_account_ids: validation.ad_account_ids || [],
    };

    logger.debug('MCP authentication successful', {
      user_id: validation.user_id,
      ad_accounts: validation.ad_account_ids?.length,
    });

    next();
  } catch (error: any) {
    logger.error('MCP authentication error', { error });

    return res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal server error during authentication',
        data: {
          error: error.message,
        },
      },
    });
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      metaToken?: {
        access_token: string;
        user_id: string;
        ad_account_ids: string[];
      };
    }
  }
}

export default authenticateMCPRequest;
