'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollIndicator from './ScrollIndicator';
import { FiUserCheck, FiCheckCircle, FiLayout, FiFileText } from 'react-icons/fi';

const features = [
  {
    icon: <FiUserCheck />,
    title: '1분 체크인',
    description: '팀원 상태와 업무 상황을\n빠르고 자연스럽게 파악',
  },
  {
    icon: <FiCheckCircle />,
    title: '투두 및 체크아웃',
    description: '업무 완료까지 흐름을 놓치지 않고\n안정적으로 관리',
  },
  {
    icon: <FiLayout />,
    title: '팀 대시보드',
    description: '진척도와 분위기를 한눈에 확인\n놓치는 순간없이 즉각 대응',
  },
  {
    icon: <FiFileText />,
    title: '리포트 자동화',
    description: '데이터 기반 인사이트\n1:1 케어와 전략적 의사결정 지원',
  },
];

const Section5 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div
      id="section5"
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col justify-center items-center text-center relative px-10 py-[120px] bg-gradient-to-br from-[#f8f9fa] to-white"
    >
      <div className="w-full max-w-[1440px] mx-auto">
        <div
          className={`text-[40px] font-bold text-[#1d1d1f] mb-4 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          관리가 아니라 리더십을.
        </div>
        <div
          className={`text-[32px] font-bold text-[#6e6e73] mb-16 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          팀을 움직이는 본질에 집중하세요.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1200px] mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white rounded-3xl p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-black/[0.04] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)] flex flex-col justify-center items-center min-h-[320px] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${800 + index * 200}ms` }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#8c4bf9] to-[#b478f7] rounded-[20px] flex items-center justify-center mb-6 mx-auto transition-transform duration-300 hover:scale-110">
                <div className="text-white text-[28px]">{feature.icon}</div>
              </div>
              <h3 className="text-[32px] font-bold text-[#1d1d1f] mb-4 leading-[1.3]">
                {feature.title}
              </h3>
              <p className="text-[24px] font-bold text-[#9999a2] leading-[1.5] whitespace-pre-line">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <ScrollIndicator targetId="section6" />
    </div>
  );
};

export default Section5;