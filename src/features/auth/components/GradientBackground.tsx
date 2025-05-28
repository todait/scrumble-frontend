'use client';

import React from 'react';

interface GradientBackgroundProps {
  isAuthenticated: boolean;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ isAuthenticated }) => {
  return (
    <div className="hidden lg:block w-1/3 h-screen bg-white relative overflow-hidden">
      {/* 텍스처 배경 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* 그라데이션 원형 요소들 - 로그인 상태에 따라 다른 색상 */}
      {!isAuthenticated ? (
        // 로그인 전: 오렌지 계열 그라데이션
        <div className="absolute -left-[181px] top-[127px] w-[493px] h-[769px]">
          {/* 첫 번째 원형 그라데이션 */}
          <div 
            className="absolute top-0 left-0 w-[493px] h-[493px] rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 0, 0, 0) 0%, rgba(255, 88, 41, 1) 100%)',
              filter: 'blur(200px)',
            }}
          />
          
          {/* 두 번째 사각형 그라데이션 */}
          <div 
            className="absolute left-[128px] top-[216px] w-[237px] h-[553px]"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 151, 23, 0) 0%, rgba(255, 151, 23, 1) 100%)',
              filter: 'blur(200px)',
            }}
          />
        </div>
      ) : (
        // 로그인 후: 블루-핑크 계열 그라데이션
        <div className="absolute -left-[340px] top-[-217px] w-[811px] h-[1557px]">
          {/* 첫 번째 큰 원형 그라데이션 */}
          <div 
            className="absolute top-0 left-0 w-[811px] h-[811px] rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(0, 194, 255, 0) 0%, rgba(255, 41, 195, 1) 92.31%)',
              filter: 'blur(200px)',
            }}
          />
          
          {/* 두 번째 작은 원형 그라데이션 */}
          <div 
            className="absolute left-[159px] top-[344px] w-[493px] h-[493px] rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(0, 194, 255, 0) 0%, rgba(255, 41, 195, 1) 92.31%)',
              filter: 'blur(200px)',
            }}
          />
          
          {/* 세 번째 사각형 그라데이션 */}
          <div 
            className="absolute left-[287px] top-[560px] w-[237px] h-[997px]"
            style={{
              background: 'linear-gradient(180deg, rgba(24, 75, 255, 0) 0%, rgba(23, 74, 255, 1) 100%)',
              filter: 'blur(200px)',
            }}
          />
        </div>
      )}
    </div>
  );
};