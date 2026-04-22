export const LOCAL_DEV_BYPASS_TOKEN = 'local-dev-bypass';

export const isLocalDevBypassEnabled = (authorization?: string) =>
  process.env.NODE_ENV !== 'production' &&
  authorization === `Bearer ${LOCAL_DEV_BYPASS_TOKEN}`;

export const buildLocalDevUser = () => ({
  sub: 'local-dev-user',
  id: 'local-dev-user',
  email: 'local@dev',
  role: 'ADMIN',
});