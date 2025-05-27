import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode 활성화
  reactStrictMode: true,
  
  // 폰트 최적화 설정
  optimizeFonts: true,
  
  // 실험적 기능 설정
  experimental: {
    // 폰트 로딩 최적화
    optimizePackageImports: ['next/font/google'],
  },
};

export default nextConfig;
