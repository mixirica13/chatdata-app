// Facebook SDK Types
export interface FacebookSDK {
  init: (params: FacebookInitParams) => void;
  login: (callback: (response: FacebookLoginResponse) => void, params?: FacebookLoginParams) => void;
  logout: (callback?: () => void) => void;
  getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void;
  api: (
    path: string,
    method: 'GET' | 'POST' | 'DELETE',
    params: Record<string, any>,
    callback: (response: FacebookApiResponse) => void
  ) => void;
  api: (
    path: string,
    callback: (response: FacebookApiResponse) => void
  ) => void;
}

export interface FacebookInitParams {
  appId: string;
  cookie?: boolean;
  xfbml?: boolean;
  version: string;
}

export interface FacebookLoginParams {
  scope?: string;
  return_scopes?: boolean;
  auth_type?: string;
  enable_profile_selector?: boolean;
  profile_selector_ids?: string;
}

export interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: FacebookAuthResponse;
}

export interface FacebookAuthResponse {
  accessToken: string; // Present in normal Facebook Login and User Access Token configuration
  expiresIn: number;
  signedRequest: string;
  userID: string;
  grantedScopes?: string;
  data_access_expiration_time?: number;
}

export interface FacebookApiResponse {
  data?: any;
  error?: FacebookError;
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface FacebookError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

// Meta Ads API Types
export interface AdAccount {
  id: string;
  account_id: string;
  name: string;
  currency: string;
  account_status?: number;
  business?: {
    id: string;
    name: string;
  };
  timezone_name?: string;
  amount_spent?: string;
  balance?: string;
}

export interface AdAccountsResponse {
  data: AdAccount[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface MetaConnection {
  user_id: string;
  access_token: string;
  token_expires_at: number;
  granted_scopes: string[];
  ad_accounts: AdAccount[];
}

// Window extension for Facebook SDK
declare global {
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}
