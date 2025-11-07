import { FacebookSDK, FacebookInitParams } from '@/types/facebook';

const APP_ID = import.meta.env.VITE_META_APP_ID;
const API_VERSION = import.meta.env.VITE_META_API_VERSION || 'v24.0';

export const initFacebookSDK = (): Promise<FacebookSDK> => {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    // Wait for SDK to load
    window.fbAsyncInit = () => {
      if (!window.FB) {
        reject(new Error('Facebook SDK failed to load'));
        return;
      }

      const initParams: FacebookInitParams = {
        appId: APP_ID,
        cookie: true,
        xfbml: true,
        version: API_VERSION,
      };

      window.FB.init(initParams);
      resolve(window.FB);
    };

    // Check if script is already in DOM
    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    // If SDK script fails to load after timeout
    const timeout = setTimeout(() => {
      reject(new Error('Facebook SDK load timeout'));
    }, 10000);

    // Clear timeout when SDK loads
    const originalFbAsyncInit = window.fbAsyncInit;
    window.fbAsyncInit = () => {
      clearTimeout(timeout);
      if (originalFbAsyncInit) {
        originalFbAsyncInit();
      }
    };
  });
};

export const getFacebookSDK = async (): Promise<FacebookSDK> => {
  if (window.FB) {
    return window.FB;
  }
  return initFacebookSDK();
};
