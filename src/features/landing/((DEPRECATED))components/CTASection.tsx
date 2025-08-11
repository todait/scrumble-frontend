'use client';

import { useEffect, useRef, useState } from 'react';

interface CTAProps {
  openModal: () => void;
}

const CTASection = ({ openModal }: CTAProps) => {
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
      id="section2"
      ref={sectionRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#F9F9F8] px-10 py-20 text-center"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div
          className={`duration-800 mb-14 transition-[opacity,transform] ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}
        >
          <div className={`duration-800 mb-6 text-[40px] font-bold text-[#6e6e73]`}>
            Scrumble로 관리 시간을 절반으로 줄이고
          </div>
          <div className={`duration-800 mb-6 text-[40px] font-bold text-[#1d1d1f]`}>
            팀 리더 본연의 역할에 집중하세요.
          </div>
        </div>
        <div
          className={`duration-800 transition-[opacity,transform] ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: isVisible ? '800ms' : '0ms' }}
        >
          <button
            onClick={openModal}
            className={`rounded-full bg-[#1d1d1f] px-[60px] py-[30px] text-2xl font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#333] hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]`}
          >
            클로즈베타테스터 신청하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
