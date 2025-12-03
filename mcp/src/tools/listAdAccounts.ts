import { metaApiClient } from '../services/metaApi.js';
import { withCache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import {
  UserToken,
  ToolResult,
  ListAdAccountsParams,
  ListAdAccountsParamsSchema,
} from '../types/index.js';

export async function listAdAccountsTool(
  parameters: Record<string, any>,
  user: UserToken
): Promise<ToolResult> {
  // Validar parâmetros
  const params = ListAdAccountsParamsSchema.parse(parameters);

  const cacheKey = `ad_accounts:${user.meta_user_id}`;
  const cacheTTL = 3600; // 1 hora

  logger.info('Executing list_ad_accounts', {
    userId: user.user_id,
    metaUserId: user.meta_user_id,
  });

  return withCache(
    cacheKey,
    cacheTTL,
    async () => {
      const data = await metaApiClient.getAdAccounts(
        user.meta_access_token,
        params.fields
      );

      const accounts = data.data.map((account: any) => ({
        id: account.id,
        name: account.name,
        currency: account.currency,
        status: account.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
        timezone_name: account.timezone_name,
      }));

      logger.info('list_ad_accounts completed', {
        userId: user.user_id,
        accountsCount: accounts.length,
      });

      return accounts;
    },
    'list_ad_accounts'
  );
}

export default listAdAccountsTool;
