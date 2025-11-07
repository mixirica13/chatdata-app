import { FacebookSDK } from '@/types/facebook';

/**
 * Get the Facebook SDK instance.
 * The SDK is initialized inline in index.html, this function just waits for it to be ready.
 */
export const initFacebookSDK = (): Promise<FacebookSDK> => {
  return new Promise((resolve, reject) => {
    // Check if SDK is already loaded and initialized
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    // Set timeout for SDK load failure
    const timeout = setTimeout(() => {
      reject(new Error('Facebook SDK load timeout - SDK not loaded after 10 seconds'));
    }, 10000);

    // Wait for SDK to be initialized (fbAsyncInit is called in index.html)
    const checkFB = setInterval(() => {
      if (window.FB) {
        clearTimeout(timeout);
        clearInterval(checkFB);
        console.log('Facebook SDK ready');
        resolve(window.FB);
      }
    }, 100);
  });
};

export const getFacebookSDK = async (): Promise<FacebookSDK> => {
  if (window.FB) {
    return window.FB;
  }
  return initFacebookSDK();
};
