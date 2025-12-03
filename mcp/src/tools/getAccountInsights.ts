import { metaApiClient } from '../services/metaApi.js';
import { withCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import {
  UserToken,
  ToolResult,
  GetAccountInsightsParams,
  GetAccountInsightsParamsSchema,
} from '../types/index.js';

export async function getAccountInsightsTool(
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  // Validar parâmetros
  const params = GetAccountInsightsParamsSchema.parse(parameters);

  const adAccountId = params.ad_account_id || user.ad_account_ids[0];

  if (!adAccountId) {
    throw new Error('No ad account available. Please connect a Meta Ads account first.');
  }

  const datePreset = params.date_preset || 'last_7d';
  const level = params.level || 'account';

  const cacheKey = `account_insights:${adAccountId}:${datePreset}:${level}`;
  const cacheTTL = datePreset === 'today' ? 300 : 3600;

  logger.info('Executing get_account_insights', {
    userId: user.user_id,
    adAccountId,
    datePreset,
    level,
  });

  return withCache(
    cacheKey,
    cacheTTL,
    async () => {
      const data = await metaApiClient.getAccountInsights(
        adAccountId,
        user.meta_access_token,
        {
          date_preset: datePreset,
          level,
          breakdowns: params.breakdowns,
        }
      );

      const insights = data.data[0] || {};

      // Processar ações (conversões)
      const actions = insights.actions || [];
      const conversions = actions.reduce((acc: any, action: any) => {
        acc[action.action_type] = parseInt(action.value);
        return acc;
      }, {});

      const result = {
        account_id: adAccountId,
        date_start: insights.date_start,
        date_stop: insights.date_stop,
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        spend: parseFloat(insights.spend || '0'),
        ctr: parseFloat(insights.ctr || '0'),
        cpc: parseFloat(insights.cpc || '0'),
        cpm: parseFloat(insights.cpm || '0'),
        reach: parseInt(insights.reach || '0'),
        frequency: parseFloat(insights.frequency || '0'),
        conversions,
      };

      logger.info('get_account_insights completed', {
        userId: user.user_id,
        adAccountId,
        spend: result.spend,
        impressions: result.impressions,
      });

      return result;
    },
    'get_account_insights'
  );
}

export default getAccountInsightsTool;
