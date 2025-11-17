import { useState, useEffect, useCallback } from 'react';
import { getFacebookSDK } from '@/lib/facebookSDK';
import { FacebookLoginResponse, FacebookAuthResponse } from '@/types/facebook';
import { toast } from 'sonner';

const PERMISSIONS = import.meta.env.VITE_META_PERMISSIONS ||
  'ads_management,ads_read,business_management,pages_read_engagement';

const CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID || '';

interface UseFacebookLoginResult {
  isInitialized: boolean;
  isLoading: boolean;
  authResponse: FacebookAuthResponse | null;
  login: () => Promise<FacebookAuthResponse | null>;
  logout: () => Promise<void>;
  checkLoginStatus: () => Promise<FacebookAuthResponse | null>;
}

export const useFacebookLogin = (): UseFacebookLoginResult => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authResponse, setAuthResponse] = useState<FacebookAuthResponse | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        await getFacebookSDK();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Facebook SDK:', error);
        toast.error('Erro ao inicializar Facebook SDK');
      }
    };

    initSDK();
  }, []);

  const checkLoginStatus = useCallback(async (): Promise<FacebookAuthResponse | null> => {
    if (!isInitialized) {
      return null;
    }

    try {
      const FB = await getFacebookSDK();

      return new Promise((resolve) => {
        FB.getLoginStatus((response: FacebookLoginResponse) => {
          if (response.status === 'connected' && response.authResponse) {
            setAuthResponse(response.authResponse);
            resolve(response.authResponse);
          } else {
            setAuthResponse(null);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error checking login status:', error);
      return null;
    }
  }, [isInitialized]);

  const login = useCallback(async (): Promise<FacebookAuthResponse | null> => {
    if (!isInitialized) {
      toast.error('Facebook SDK não inicializado');
      return null;
    }

    setIsLoading(true);

    try {
      const FB = await getFacebookSDK();

      return new Promise((resolve) => {
        // Use Facebook Login for Business if CONFIG_ID is provided
        const loginOptions: any = {
          scope: PERMISSIONS,
          return_scopes: true,
          auth_type: 'rerequest', // Request permissions again if previously declined
        };

        // Add config_id for Facebook Login for Business (required for Business apps)
        if (CONFIG_ID) {
          loginOptions.config_id = CONFIG_ID;
          loginOptions.response_type = 'code'; // Required for Business Login
        }

        FB.login(
          (response: FacebookLoginResponse) => {
            setIsLoading(false);

            if (response.status === 'connected' && response.authResponse) {
              setAuthResponse(response.authResponse);
              toast.success('Login realizado com sucesso!');
              resolve(response.authResponse);
            } else {
              toast.error('Login cancelado ou não autorizado');
              resolve(null);
            }
          },
          loginOptions
        );
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Facebook login error:', error);
      toast.error('Erro ao fazer login com Facebook');
      return null;
    }
  }, [isInitialized]);

  const logout = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      return;
    }

    try {
      const FB = await getFacebookSDK();

      return new Promise((resolve) => {
        FB.logout(() => {
          setAuthResponse(null);
          toast.success('Logout realizado com sucesso');
          resolve();
        });
      });
    } catch (error) {
      console.error('Facebook logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  }, [isInitialized]);

  return {
    isInitialized,
    isLoading,
    authResponse,
    login,
    logout,
    checkLoginStatus,
  };
};
