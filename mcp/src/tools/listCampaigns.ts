import { metaApiClient } from '../services/metaApi.js';
import { withCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import {
  UserToken,
  ToolResult,
  ListCampaignsParams,
  ListCampaignsParamsSchema,
} from '../types/index.js';

export async function listCampaignsTool(
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  // Validar parâmetros
  const params = ListCampaignsParamsSchema.parse(parameters);

  // Determinar conta de anúncios
  const adAccountId = params.ad_account_id || user.ad_account_ids[0];

  if (!adAccountId) {
    throw new Error('No ad account available. Please connect a Meta Ads account first.');
  }

  const status = params.status || 'ACTIVE';
  const limit = params.limit || 25;

  const cacheKey = `campaigns:${adAccountId}:${status}:${limit}`;
  const cacheTTL = 300; // 5 minutos

  logger.info('Executing list_campaigns', {
    userId: user.user_id,
    adAccountId,
    status,
    limit,
  });

  return withCache(
    cacheKey,
    cacheTTL,
    async () => {
      const apiParams: any = {
        fields: params.fields,
        limit,
      };

      // Adicionar filtro de status se não for ALL
      if (status !== 'ALL') {
        apiParams.filtering = [
          {
            field: 'effective_status',
            operator: 'IN',
            value: [status],
          },
        ];
      }

      const data = await metaApiClient.getCampaigns(
        adAccountId,
        user.meta_access_token,
        apiParams
      );

      const campaigns = data.data.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        effective_status: campaign.effective_status,
        objective: campaign.objective,
        daily_budget: campaign.daily_budget
          ? parseFloat(campaign.daily_budget) / 100
          : null,
      }));

      logger.info('list_campaigns completed', {
        userId: user.user_id,
        campaignsCount: campaigns.length,
      });

      return campaigns;
    },
    'list_campaigns'
  );
}

export default listCampaignsTool;
