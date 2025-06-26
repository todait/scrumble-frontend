declare module 'next-pwa' {
  import { NextConfig } from 'next';

  export interface PWAConfig {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: 'CacheFirst' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate';
      method?: string;
      options?: {
        cacheName: string;
        expiration?: {
          maxEntries?: number;
          maxAgeSeconds?: number;
        };
        networkTimeoutSeconds?: number;
      };
    }>;
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export default withPWA;
}