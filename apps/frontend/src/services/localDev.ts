export const LOCAL_DEV_BYPASS_TOKEN = 'local-dev-bypass';
export const LOCAL_AUTO_LOGIN_SKIP_KEY = 'skip-local-auto-login';

export const isBrowser = () => typeof window !== 'undefined';

export const isLocalhost = () =>
  isBrowser() && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

export const getStoredAuthToken = () =>
  isBrowser() ? localStorage.getItem('auth-token') : null;

export const isLocalDevBypassSession = () =>
  isLocalhost() && getStoredAuthToken() === LOCAL_DEV_BYPASS_TOKEN;

export const shouldSkipLocalAutoLogin = () =>
  isBrowser() && sessionStorage.getItem(LOCAL_AUTO_LOGIN_SKIP_KEY) === '1';

export const suppressLocalAutoLogin = () => {
  if (isLocalhost()) {
    sessionStorage.setItem(LOCAL_AUTO_LOGIN_SKIP_KEY, '1');
  }
};

export const clearLocalAutoLoginSuppression = () => {
  if (isBrowser()) {
    sessionStorage.removeItem(LOCAL_AUTO_LOGIN_SKIP_KEY);
  }
};