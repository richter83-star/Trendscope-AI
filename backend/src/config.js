import dotenv from 'dotenv';

dotenv.config();

export const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const loadConfig = (env = process.env) => {
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

  return {
    port: toNumber(env.PORT, 4000),
    allowedOrigins,
    trendLimits: {
      free: toNumber(env.WATCHLIST_FREE_LIMIT, 10),
      starter: toNumber(env.WATCHLIST_STARTER_LIMIT, 50),
      pro: toNumber(env.WATCHLIST_PRO_LIMIT, 500)
    },
    mockProductCount: toNumber(env.MOCK_PRODUCT_COUNT, 40)
  };
};
