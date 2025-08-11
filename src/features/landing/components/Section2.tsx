'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollIndicator from './ScrollIndicator';

interface Section2Props {
  openModal: () => void;
}

const Section2 = ({ openModal }: Section2Props) => {
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
      id="section2"
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col justify-center items-center text-center relative px-10 py-20 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]"
    >
      <div className="w-full max-w-[1440px] mx-auto">
        <div
          className={`text-[40px] font-bold text-[#6e6e73] mb-6 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          Scrumble로 관리 시간을 절반으로 줄이고
        </div>
        <div
          className={`text-[40px] font-bold text-[#1d1d1f] mb-12 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          팀 리더 본연의 역할에 집중하세요.
        </div>
        <button
          onClick={openModal}
          className={`bg-[#1d1d1f] text-white px-[60px] py-5 rounded-full text-lg font-bold transition-all duration-300 hover:bg-[#333] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          클로즈베타테스터 신청하기
        </button>
      </div>
      <ScrollIndicator targetId="section4" />
    </div>
  );
};

export default Section2;