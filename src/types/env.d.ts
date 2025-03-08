/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TRADES_ENDPOINT: string;
  readonly VITE_API_TIMEOUT_MS: string;
  readonly VITE_API_CACHE_TIME_MS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}