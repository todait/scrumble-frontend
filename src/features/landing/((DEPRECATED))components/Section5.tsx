'use client';

import { useEffect, useRef, useState } from 'react';
import { FiCheckCircle, FiFileText, FiLayout, FiUserCheck } from 'react-icons/fi';

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
      entries => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    const element = sectionRef.current;
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <div
      id="section5"
      ref={sectionRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-white px-10 py-[120px] text-center"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div
          className={`duration-800 mb-4 text-[40px] font-bold text-[#1d1d1f] transition-[opacity,transform] ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}
        >
          관리가 아니라 리더십을.
        </div>
        <div
          className={`duration-800 mb-16 text-[32px] font-bold text-[#6e6e73] transition-[opacity,transform] ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: isVisible ? '500ms' : '0ms' }}
        >
          팀을 움직이는 본질에 집중하세요.
        </div>

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`duration-800 transition-[opacity,transform] ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: isVisible ? `${800 + index * 200}ms` : '0ms' }}
            >
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-black/[0.04] bg-white p-10 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)]">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#8c4bf9] to-[#b478f7] transition-transform duration-300 hover:scale-110">
                  <div className="text-[28px] text-white">{feature.icon}</div>
                </div>
                <h3 className="mb-4 text-[32px] font-bold leading-[1.3] text-[#1d1d1f]">
                  {feature.title}
                </h3>
                <p className="whitespace-pre-line text-[24px] font-bold leading-[1.5] text-[#9999a2]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section5;
