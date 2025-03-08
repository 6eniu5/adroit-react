export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL as string,
    endpoints: {
      trades: import.meta.env.VITE_API_TRADES_ENDPOINT as string,
    },
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 30000),
    cacheTime: Number(import.meta.env.VITE_API_CACHE_TIME_MS || 300000),
  }
};