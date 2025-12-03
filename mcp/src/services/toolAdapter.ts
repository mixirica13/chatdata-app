/**
 * Tool Adapter
 * Adapta as tools existentes para funcionar com o protocolo MCP
 * e o Meta Access Token direto (sem MCP token intermediário)
 */

import { listAdAccountsTool } from '../tools/listAdAccounts.js';
import { listCampaignsTool } from '../tools/listCampaigns.js';
import { getCampaignInsightsTool } from '../tools/getCampaignInsights.js';
import { getAccountInsightsTool } from '../tools/getAccountInsights.js';
import { searchCampaignsTool } from '../tools/searchCampaigns.js';
import { listAdsetsTool } from '../tools/listAdsets.js';
import { getAdsetInsightsTool } from '../tools/getAdsetInsights.js';
import { listAdsTool } from '../tools/listAds.js';
import { getAdInsightsTool } from '../tools/getAdInsights.js';
import { UserToken } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class ToolAdapter {
  /**
   * Converte dados do Meta Token para UserToken
   */
  private createUserToken(metaToken: {
    access_token: string;
    user_id: string;
    ad_account_ids: string[];
  }): UserToken {
    return {
      id: metaToken.user_id,
      user_id: metaToken.user_id,
      mcp_token: '', // Não usado neste fluxo
      meta_access_token: metaToken.access_token,
      meta_token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      meta_user_id: metaToken.user_id,
      meta_user_name: '',
      ad_account_ids: metaToken.ad_account_ids,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Executa uma tool pelo nome
   */
  async executeTool(
    toolName: string,
    args: Record<string, any>,
    metaToken: {
      access_token: string;
      user_id: string;
      ad_account_ids: string[];
    }
  ): Promise<any> {
    const userToken = this.createUserToken(metaToken);

    logger.info('ToolAdapter executing tool', {
      toolName,
      userId: metaToken.user_id,
      args,
    });

    let result;

    switch (toolName) {
      case 'list_ad_accounts':
        result = await listAdAccountsTool(args, userToken);
        break;

      case 'list_campaigns':
        result = await listCampaignsTool(args, userToken);
        break;

      case 'get_campaign_insights':
        result = await getCampaignInsightsTool(args, userToken);
        break;

      case 'get_account_insights':
        result = await getAccountInsightsTool(args, userToken);
        break;

      case 'search_campaigns':
        result = await searchCampaignsTool(args, userToken);
        break;

      case 'list_adsets':
        result = await listAdsetsTool(args, userToken);
        break;

      case 'get_adset_insights':
        result = await getAdsetInsightsTool(args, userToken);
        break;

      case 'list_ads':
        result = await listAdsTool(args, userToken);
        break;

      case 'get_ad_insights':
        result = await getAdInsightsTool(args, userToken);
        break;

      default:
        throw new Error(`Tool '${toolName}' not found`);
    }

    logger.info('ToolAdapter tool executed', {
      toolName,
      userId: metaToken.user_id,
      cached: result.cached,
    });

    // Retornar apenas os dados, metadados são opcionais
    return {
      data: result.data,
      metadata: {
        cached: result.cached,
        cache_ttl: result.cache_ttl,
      },
    };
  }
}

export const toolAdapter = new ToolAdapter();
export default toolAdapter;
