import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { UserToken } from '../types/index.js';

export class TokenManager {
  /**
   * Gera um token MCP único
   */
  generateMCPToken(): string {
    const prefix = 'mcp';
    const random = crypto.randomBytes(32).toString('hex');
    const timestamp = Date.now().toString(36);

    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Busca um token MCP no banco de dados
   */
  async findByMCPToken(mcpToken: string): Promise<UserToken | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('mcp_tokens')
        .select('*')
        .eq('mcp_token', mcpToken)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }

      return this.mapToUserToken(data);
    } catch (error) {
      logger.error('Error finding MCP token', { error });
      return null;
    }
  }

  /**
   * Cria um novo token MCP para um usuário
   */
  async createMCPToken(
    userId: string,
    metaAccessToken: string,
    metaTokenExpiresAt: Date,
    metaUserId: string,
    metaUserName: string,
    adAccountIds: string[]
  ): Promise<UserToken> {
    try {
      const mcpToken = this.generateMCPToken();

      const { data, error } = await supabaseAdmin
        .from('mcp_tokens')
        .insert({
          user_id: userId,
          mcp_token: mcpToken,
          meta_access_token: metaAccessToken,
          meta_token_expires_at: metaTokenExpiresAt.toISOString(),
          meta_user_id: metaUserId,
          meta_user_name: metaUserName,
          ad_account_ids: adAccountIds,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('MCP token created', { userId, metaUserId });

      return this.mapToUserToken(data);
    } catch (error) {
      logger.error('Error creating MCP token', { error });
      throw error;
    }
  }

  /**
   * Atualiza o token Meta de um token MCP
   */
  async updateMetaToken(
    mcpTokenId: string,
    metaAccessToken: string,
    metaTokenExpiresAt: Date
  ): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('mcp_tokens')
        .update({
          meta_access_token: metaAccessToken,
          meta_token_expires_at: metaTokenExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', mcpTokenId);

      if (error) {
        throw error;
      }

      logger.info('Meta token updated', { mcpTokenId });
    } catch (error) {
      logger.error('Error updating Meta token', { error });
      throw error;
    }
  }

  /**
   * Renova o token Meta
   */
  async renewMetaToken(userToken: UserToken): Promise<{
    access_token: string;
    expires_at: Date;
  } | null> {
    try {
      const url = new URL(`https://graph.facebook.com/${config.meta.apiVersion}/oauth/access_token`);
      url.searchParams.append('grant_type', 'fb_exchange_token');
      url.searchParams.append('client_id', config.meta.appId);
      url.searchParams.append('client_secret', config.meta.appSecret);
      url.searchParams.append('fb_exchange_token', userToken.meta_access_token);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        logger.error('Failed to renew Meta token', { error: data });
        return null;
      }

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

      // Atualizar no banco de dados
      await this.updateMetaToken(userToken.id, data.access_token, expiresAt);

      logger.info('Meta token renewed successfully', { userId: userToken.user_id });

      return {
        access_token: data.access_token,
        expires_at: expiresAt,
      };
    } catch (error) {
      logger.error('Error renewing Meta token', { error });
      return null;
    }
  }

  /**
   * Mapeia dados do banco para UserToken
   */
  private mapToUserToken(data: any): UserToken {
    return {
      id: data.id,
      user_id: data.user_id,
      mcp_token: data.mcp_token,
      meta_access_token: data.meta_access_token,
      meta_token_expires_at: new Date(data.meta_token_expires_at),
      meta_user_id: data.meta_user_id,
      meta_user_name: data.meta_user_name,
      ad_account_ids: data.ad_account_ids || [],
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }

  /**
   * Deleta um token MCP
   */
  async deleteMCPToken(mcpTokenId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('mcp_tokens')
        .delete()
        .eq('id', mcpTokenId);

      if (error) {
        throw error;
      }

      logger.info('MCP token deleted', { mcpTokenId });
    } catch (error) {
      logger.error('Error deleting MCP token', { error });
      throw error;
    }
  }
}

export const tokenManager = new TokenManager();
export default tokenManager;
