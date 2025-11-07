import { getFacebookSDK } from './facebookSDK';
import { AdAccount, AdAccountsResponse, FacebookApiResponse } from '@/types/facebook';

const API_VERSION = import.meta.env.VITE_META_API_VERSION || 'v24.0';

export class MetaGraphAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get all ad accounts accessible by the current user
   * Uses the /me/adaccounts endpoint
   */
  async getAdAccounts(): Promise<AdAccount[]> {
    try {
      const FB = await getFacebookSDK();

      return new Promise((resolve, reject) => {
        FB.api(
          '/me/adaccounts',
          'GET',
          {
            access_token: this.accessToken,
            fields: 'id,account_id,name,currency,account_status,business,timezone_name,amount_spent,balance',
          },
          (response: FacebookApiResponse) => {
            if (response.error) {
              console.error('Error fetching ad accounts:', response.error);
              reject(new Error(response.error.message));
              return;
            }

            const accountsResponse = response as AdAccountsResponse;
            resolve(accountsResponse.data || []);
          }
        );
      });
    } catch (error) {
      console.error('Failed to get ad accounts:', error);
      throw error;
    }
  }

  /**
   * Get information about the current user
   */
  async getUserInfo(): Promise<any> {
    try {
      const FB = await getFacebookSDK();

      return new Promise((resolve, reject) => {
        FB.api(
          '/me',
          'GET',
          {
            access_token: this.accessToken,
            fields: 'id,name,email',
          },
          (response: FacebookApiResponse) => {
            if (response.error) {
              console.error('Error fetching user info:', response.error);
              reject(new Error(response.error.message));
              return;
            }

            resolve(response.data || response);
          }
        );
      });
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  }

  /**
   * Get business managers accessible by the current user
   */
  async getBusinesses(): Promise<any[]> {
    try {
      const FB = await getFacebookSDK();

      return new Promise((resolve, reject) => {
        FB.api(
          '/me/businesses',
          'GET',
          {
            access_token: this.accessToken,
            fields: 'id,name,primary_page,timezone_offset_hours_utc,verification_status',
          },
          (response: FacebookApiResponse) => {
            if (response.error) {
              console.error('Error fetching businesses:', response.error);
              reject(new Error(response.error.message));
              return;
            }

            resolve(response.data || []);
          }
        );
      });
    } catch (error) {
      console.error('Failed to get businesses:', error);
      throw error;
    }
  }

  /**
   * Exchange a short-lived token for a long-lived token
   * Note: This should ideally be done server-side for security
   */
  async exchangeToken(): Promise<{ access_token: string; expires_in: number }> {
    const APP_ID = import.meta.env.VITE_META_APP_ID;
    const APP_SECRET = import.meta.env.VITE_META_APP_SECRET;

    if (!APP_SECRET) {
      throw new Error('App secret not configured. Token exchange should be done server-side.');
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/${API_VERSION}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${APP_ID}&` +
        `client_secret=${APP_SECRET}&` +
        `fb_exchange_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to exchange token');
      }

      return await response.json();
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  /**
   * Debug an access token to get information about it
   */
  async debugToken(): Promise<any> {
    const APP_ID = import.meta.env.VITE_META_APP_ID;
    const APP_SECRET = import.meta.env.VITE_META_APP_SECRET;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${API_VERSION}/debug_token?` +
        `input_token=${this.accessToken}&` +
        `access_token=${APP_ID}|${APP_SECRET}`
      );

      if (!response.ok) {
        throw new Error('Failed to debug token');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Token debug error:', error);
      throw error;
    }
  }
}

/**
 * Helper function to create a MetaGraphAPI instance
 */
export const createMetaGraphAPI = (accessToken: string): MetaGraphAPI => {
  return new MetaGraphAPI(accessToken);
};
