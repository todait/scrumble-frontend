'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollIndicator from './ScrollIndicator';

const Section4 = () => {
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
      id="section4"
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col justify-center items-center text-center relative px-10 py-20 bg-gradient-to-br from-white to-[#f5f5f7]"
    >
      <div className="w-full max-w-[1440px] mx-auto">
        <div
          className={`text-[40px] font-bold mb-6 transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <span className="text-[#9999a2]">관리 대신</span>{' '}
          <span className="text-[#1d1d1f]">전략에,</span>
        </div>
        <div
          className={`text-[40px] font-bold transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <span className="text-[#9999a2]">보고 대신</span>{' '}
          <span className="text-[#1d1d1f]">결정에 집중.</span>
        </div>
      </div>
      <ScrollIndicator targetId="section5" />
    </div>
  );
};

export default Section4;