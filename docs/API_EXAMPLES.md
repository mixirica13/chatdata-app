# Exemplos de Uso da Meta Marketing API

Este documento contém exemplos práticos de como usar a integração com a Meta Marketing API após a configuração inicial.

## Obter Access Token

### Usando o Hook

```typescript
import { useFacebookLogin } from '@/hooks/useFacebookLogin';

function MyComponent() {
  const { login, authResponse, isLoading, logout } = useFacebookLogin();

  const handleLogin = async () => {
    const auth = await login();
    if (auth) {
      console.log('Access Token:', auth.accessToken);
      console.log('Expires in:', auth.expiresIn, 'seconds');
      console.log('User ID:', auth.userID);
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Conectando...' : 'Conectar com Meta'}
    </button>
  );
}
```

## Buscar Contas de Anúncios

### Método 1: Usando a API Helper

```typescript
import { createMetaGraphAPI } from '@/lib/metaGraphAPI';

const getAdAccounts = async (accessToken: string) => {
  const api = createMetaGraphAPI(accessToken);

  try {
    const accounts = await api.getAdAccounts();
    console.log('Ad Accounts:', accounts);

    accounts.forEach(account => {
      console.log(`Account: ${account.name}`);
      console.log(`ID: ${account.account_id}`);
      console.log(`Currency: ${account.currency}`);
      console.log(`Business: ${account.business?.name}`);
    });

    return accounts;
  } catch (error) {
    console.error('Error fetching ad accounts:', error);
  }
};
```

### Método 2: Usando Facebook SDK Diretamente

```typescript
import { getFacebookSDK } from '@/lib/facebookSDK';

const getAdAccountsManual = async (accessToken: string) => {
  const FB = await getFacebookSDK();

  FB.api(
    '/me/adaccounts',
    'GET',
    {
      access_token: accessToken,
      fields: 'id,name,currency,account_status,business'
    },
    (response) => {
      if (response.error) {
        console.error('Error:', response.error);
      } else {
        console.log('Accounts:', response.data);
      }
    }
  );
};
```

## Buscar Campanhas

```typescript
const getCampaigns = async (accessToken: string, adAccountId: string) => {
  const FB = await getFacebookSDK();

  return new Promise((resolve, reject) => {
    FB.api(
      `/${adAccountId}/campaigns`,
      'GET',
      {
        access_token: accessToken,
        fields: 'id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time',
        limit: 100
      },
      (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data);
        }
      }
    );
  });
};

// Uso
const campaigns = await getCampaigns(accessToken, 'act_123456789');
console.log('Campaigns:', campaigns);
```

## Buscar Insights de Campanha

```typescript
const getCampaignInsights = async (
  accessToken: string,
  campaignId: string,
  dateRange: { since: string; until: string }
) => {
  const FB = await getFacebookSDK();

  return new Promise((resolve, reject) => {
    FB.api(
      `/${campaignId}/insights`,
      'GET',
      {
        access_token: accessToken,
        fields: 'impressions,clicks,spend,cpc,cpm,ctr,reach,frequency',
        time_range: JSON.stringify(dateRange),
        level: 'campaign'
      },
      (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data);
        }
      }
    );
  });
};

// Uso
const insights = await getCampaignInsights(
  accessToken,
  '123456789',
  { since: '2025-01-01', until: '2025-01-31' }
);
console.log('Campaign Insights:', insights);
```

## Buscar Ad Sets

```typescript
const getAdSets = async (accessToken: string, campaignId: string) => {
  const FB = await getFacebookSDK();

  return new Promise((resolve, reject) => {
    FB.api(
      `/${campaignId}/adsets`,
      'GET',
      {
        access_token: accessToken,
        fields: 'id,name,status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event',
        limit: 100
      },
      (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data);
        }
      }
    );
  });
};
```

## Buscar Anúncios

```typescript
const getAds = async (accessToken: string, adSetId: string) => {
  const FB = await getFacebookSDK();

  return new Promise((resolve, reject) => {
    FB.api(
      `/${adSetId}/ads`,
      'GET',
      {
        access_token: accessToken,
        fields: 'id,name,status,creative{object_story_spec},targeting',
        limit: 100
      },
      (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data);
        }
      }
    );
  });
};
```

## Buscar Métricas em Tempo Real

```typescript
const getRealTimeInsights = async (accessToken: string, adAccountId: string) => {
  const FB = await getFacebookSDK();

  return new Promise((resolve, reject) => {
    FB.api(
      `/${adAccountId}/insights`,
      'GET',
      {
        access_token: accessToken,
        fields: 'impressions,clicks,spend,reach,actions',
        time_range: JSON.stringify({ since: 'today', until: 'today' }),
        level: 'account',
        date_preset: 'today'
      },
      (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data[0] || {});
        }
      }
    );
  });
};
```

## Buscar Informações de Business Manager

```typescript
const getBusinessInfo = async (accessToken: string) => {
  const api = createMetaGraphAPI(accessToken);

  try {
    const businesses = await api.getBusinesses();

    businesses.forEach(business => {
      console.log(`Business: ${business.name}`);
      console.log(`ID: ${business.id}`);
      console.log(`Verification Status: ${business.verification_status}`);
    });

    return businesses;
  } catch (error) {
    console.error('Error fetching businesses:', error);
  }
};
```

## Trocar Token por Long-Lived Token

```typescript
const getLongLivedToken = async (shortLivedToken: string) => {
  const api = createMetaGraphAPI(shortLivedToken);

  try {
    const result = await api.exchangeToken();
    console.log('Long-lived token:', result.access_token);
    console.log('Expires in:', result.expires_in, 'seconds (~60 days)');

    // Salvar no banco de dados
    await saveTokenToDatabase(result.access_token, result.expires_in);

    return result;
  } catch (error) {
    console.error('Error exchanging token:', error);
  }
};
```

## Debug de Token

```typescript
const debugAccessToken = async (accessToken: string) => {
  const api = createMetaGraphAPI(accessToken);

  try {
    const debugInfo = await api.debugToken();

    console.log('App ID:', debugInfo.app_id);
    console.log('User ID:', debugInfo.user_id);
    console.log('Valid:', debugInfo.is_valid);
    console.log('Expires at:', new Date(debugInfo.expires_at * 1000));
    console.log('Scopes:', debugInfo.scopes);

    return debugInfo;
  } catch (error) {
    console.error('Error debugging token:', error);
  }
};
```

## Paginação de Resultados

```typescript
const getAllCampaigns = async (accessToken: string, adAccountId: string) => {
  const FB = await getFacebookSDK();
  const allCampaigns: any[] = [];

  const fetchPage = (url?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const params = url
        ? {}
        : {
            access_token: accessToken,
            fields: 'id,name,status',
            limit: 100
          };

      const endpoint = url || `/${adAccountId}/campaigns`;

      FB.api(
        endpoint,
        'GET',
        params,
        async (response) => {
          if (response.error) {
            reject(response.error);
            return;
          }

          allCampaigns.push(...response.data);

          // Se houver próxima página, buscar
          if (response.paging && response.paging.next) {
            await fetchPage(response.paging.next);
          }

          resolve();
        }
      );
    });
  };

  await fetchPage();
  return allCampaigns;
};
```

## Tratamento de Erros

```typescript
const handleMetaAPIError = (error: any) => {
  // Erros comuns da Meta API
  switch (error.code) {
    case 190:
      console.error('Access token inválido ou expirado');
      // Redirecionar para login
      break;
    case 200:
      console.error('Erro de permissões');
      // Solicitar permissões novamente
      break;
    case 4:
      console.error('Rate limit atingido');
      // Implementar retry com backoff
      break;
    case 100:
      console.error('Parâmetro inválido:', error.message);
      break;
    default:
      console.error('Erro da API:', error);
  }
};

// Uso com try-catch
const safeAPICall = async (accessToken: string) => {
  try {
    const api = createMetaGraphAPI(accessToken);
    const accounts = await api.getAdAccounts();
    return accounts;
  } catch (error: any) {
    handleMetaAPIError(error);
    throw error;
  }
};
```

## Exemplo Completo: Dashboard de Métricas

```typescript
import { useState, useEffect } from 'react';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import { createMetaGraphAPI } from '@/lib/metaGraphAPI';

function MetricsDashboard() {
  const { authResponse } = useFacebookLogin();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!authResponse) return;

      setLoading(true);
      try {
        const api = createMetaGraphAPI(authResponse.accessToken);

        // Buscar contas
        const accounts = await api.getAdAccounts();

        if (accounts.length === 0) return;

        // Buscar métricas da primeira conta
        const accountId = accounts[0].id;
        const FB = await getFacebookSDK();

        const insights = await new Promise((resolve) => {
          FB.api(
            `/${accountId}/insights`,
            'GET',
            {
              access_token: authResponse.accessToken,
              fields: 'impressions,clicks,spend,reach,ctr',
              time_range: JSON.stringify({
                since: '2025-01-01',
                until: '2025-01-31'
              })
            },
            (response) => resolve(response.data[0] || {})
          );
        });

        setMetrics(insights);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [authResponse]);

  if (loading) return <div>Carregando métricas...</div>;
  if (!metrics) return <div>Nenhuma métrica disponível</div>;

  return (
    <div>
      <h2>Métricas do Mês</h2>
      <div>Impressões: {metrics.impressions}</div>
      <div>Cliques: {metrics.clicks}</div>
      <div>Gasto: R$ {metrics.spend}</div>
      <div>Alcance: {metrics.reach}</div>
      <div>CTR: {metrics.ctr}%</div>
    </div>
  );
}
```

## Recursos Úteis

- [Marketing API Reference](https://developers.facebook.com/docs/marketing-api/reference)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Marketing API Insights](https://developers.facebook.com/docs/marketing-api/insights)
- [Error Codes](https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling)
