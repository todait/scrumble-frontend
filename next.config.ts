import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode 활성화
  reactStrictMode: true,
  
  // 이미지 설정 (Vercel 배포 최적화)
  images: {
    // 외부 도메인 허용 (기존 방식)
    domains: [
      'randomuser.me',
      'images.unsplash.com',
      'api.dicebear.com',
      'lh3.googleusercontent.com',
    ],
    // 새로운 방식: remotePatterns 사용 (더 안전함)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    // 이미지 최적화 설정
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    // Vercel에서 이미지 최적화 비활성화 (502 에러 방지)
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // 실험적 기능 설정
  experimental: {
    // 폰트 로딩 최적화
    optimizePackageImports: ['next/font/google'],
  },
};

export default nextConfig;
