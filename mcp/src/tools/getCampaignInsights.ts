import { metaApiClient } from '../services/metaApi.js';
import { withCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import {
  UserToken,
  ToolResult,
  GetCampaignInsightsParams,
  GetCampaignInsightsParamsSchema,
} from '../types/index.js';

export async function getCampaignInsightsTool(
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  // Validar parâmetros
  const params = GetCampaignInsightsParamsSchema.parse(parameters);

  const { campaign_id, date_preset = 'last_7d', time_range, fields } = params;

  const cacheKey = `insights:${campaign_id}:${date_preset || JSON.stringify(time_range)}`;
  const cacheTTL = date_preset === 'today' ? 300 : 3600; // 5min ou 1h

  logger.info('Executing get_campaign_insights', {
    userId: user.user_id,
    campaignId: campaign_id,
    datePreset: date_preset,
    timeRange: time_range,
  });

  return withCache(
    cacheKey,
    cacheTTL,
    async () => {
      const data = await metaApiClient.getCampaignInsights(
        campaign_id,
        user.meta_access_token,
        {
          fields,
          date_preset,
          time_range,
        }
      );

      if (!data.data || data.data.length === 0) {
        logger.warn('No insights data available', {
          campaignId: campaign_id,
        });
        return null;
      }

      const insights = data.data[0];

      // Processar ações (conversões)
      const actions = insights.actions || [];
      const conversions = actions.reduce((acc: any, action: any) => {
        acc[action.action_type] = parseInt(action.value);
        return acc;
      }, {});

      const result = {
        campaign_id: insights.campaign_id,
        campaign_name: insights.campaign_name,
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        spend: parseFloat(insights.spend || '0'),
        ctr: parseFloat(insights.ctr || '0'),
        cpc: parseFloat(insights.cpc || '0'),
        cpm: parseFloat(insights.cpm || '0'),
        reach: parseInt(insights.reach || '0'),
        frequency: parseFloat(insights.frequency || '0'),
        conversions,
        date_start: insights.date_start,
        date_stop: insights.date_stop,
      };

      logger.info('get_campaign_insights completed', {
        userId: user.user_id,
        campaignId: campaign_id,
        spend: result.spend,
        impressions: result.impressions,
      });

      return result;
    },
    'get_campaign_insights'
  );
}

export default getCampaignInsightsTool;
