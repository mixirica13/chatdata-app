import { metaApiClient } from '../services/metaApi.js';
import { withCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import { UserToken, ToolResult } from '../types/index.js';
import { z } from 'zod';

export const GetAdsetInsightsParamsSchema = z.object({
  adset_id: z.string(),
  date_preset: z
    .enum(['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime'])
    .optional(),
  time_range: z
    .object({
      since: z.string(),
      until: z.string(),
    })
    .optional(),
  fields: z.string().optional(),
});

export type GetAdsetInsightsParams = z.infer<typeof GetAdsetInsightsParamsSchema>;

export async function getAdsetInsightsTool(
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  // Validar parâmetros
  const params = GetAdsetInsightsParamsSchema.parse(parameters);

  const { adset_id, date_preset = 'last_7d', time_range, fields } = params;

  const cacheKey = `adset_insights:${adset_id}:${date_preset || JSON.stringify(time_range)}`;
  const cacheTTL = date_preset === 'today' ? 300 : 3600; // 5min ou 1h

  logger.info('Executing get_adset_insights', {
    userId: user.user_id,
    adsetId: adset_id,
    datePreset: date_preset,
    timeRange: time_range,
  });

  return withCache(
    cacheKey,
    cacheTTL,
    async () => {
      const metricsFields =
        fields ||
        'adset_id,adset_name,impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions,cost_per_action_type';

      // Construir URL
      let url = `https://graph.facebook.com/v21.0/${adset_id}/insights?fields=${metricsFields}&access_token=${user.meta_access_token}`;

      if (time_range) {
        url += `&time_range=${encodeURIComponent(JSON.stringify(time_range))}`;
      } else {
        url += `&date_preset=${date_preset}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || 'Failed to fetch adset insights'
        );
      }

      if (!data.data || data.data.length === 0) {
        logger.warn('No insights data available for adset', {
          adsetId: adset_id,
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

      // Processar custo por ação
      const costPerActions = insights.cost_per_action_type || [];
      const costPerAction = costPerActions.reduce((acc: any, cpa: any) => {
        acc[cpa.action_type] = parseFloat(cpa.value);
        return acc;
      }, {});

      const result = {
        adset_id: insights.adset_id,
        adset_name: insights.adset_name,
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        spend: parseFloat(insights.spend || '0'),
        ctr: parseFloat(insights.ctr || '0'),
        cpc: parseFloat(insights.cpc || '0'),
        cpm: parseFloat(insights.cpm || '0'),
        reach: parseInt(insights.reach || '0'),
        frequency: parseFloat(insights.frequency || '0'),
        conversions,
        cost_per_action: costPerAction,
        date_start: insights.date_start,
        date_stop: insights.date_stop,
      };

      logger.info('get_adset_insights completed', {
        userId: user.user_id,
        adsetId: adset_id,
        spend: result.spend,
        impressions: result.impressions,
      });

      return result;
    },
    'get_adset_insights'
  );
}

export default getAdsetInsightsTool;
