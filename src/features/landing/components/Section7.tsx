'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollIndicator from './ScrollIndicator';

const beforeList = [
  '매일 팀원 상황 확인에 시간 소모',
  '프로젝트 이슈를 늦게 발견',
  '리더십 대신 관리 업무에 갇힘',
  '팀 분위기 파악에 근거 부족',
  '번아웃을 퇴사 통보로서야 알게 됨',
];

const afterList = [
  '팀 상황을 빠르게 한눈에 파악',
  '빠른 이슈 감지와 즉각 대응 가능',
  '전략과 팀 케어에 집중하는 리더십 발휘',
  '데이터 기반으로 팀 상태와 분위기 관리',
  '지속적인 케어로 팀원 번아웃 예방',
];

const Section7 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          if (entry.isIntersecting) {
            setTimeout(() => setIsEntered(true), 1400);
          } else {
            setIsEntered(false);
          }
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
      id="section7"
      ref={sectionRef}
      className="w-full py-[120px] px-10 bg-white"
    >
      <div className="w-full max-w-[1440px] mx-auto">
        <div
          className={`text-[40px] font-bold text-[#1d1d1f] text-center mb-16 leading-[160%] transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          어제와는 다른 리더의 하루를 만드세요.
        </div>

        <div className="flex flex-col md:flex-row gap-10 max-w-[1200px] mx-auto justify-center">
          {/* Before Box */}
          <div
            className={`bg-[#f5f5f7] rounded-[32px] px-10 py-[60px] text-center cursor-pointer transition-all duration-[1200ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${isEntered ? 'flex-[0.9]' : 'flex-1'} hover:flex-1`}
            style={{ transitionDelay: '500ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <div className="text-[40px] font-bold text-[#9999a2] mb-8 text-center">
              Before
            </div>
            <ul className="list-none mb-8">
              {beforeList.map((item, index) => (
                <li key={index} className="text-2xl font-medium leading-[160%] mb-4 text-center text-[#6e6e73]">
                  {item}
                </li>
              ))}
            </ul>
            <div className="text-2xl text-[#9999a2] my-6 text-center">↓</div>
            <div className="text-[32px] font-bold text-center text-[#6e6e73]">
              관리가 전부인 리더
            </div>
          </div>

          {/* After Box */}
          <div
            className={`bg-[#333333] rounded-[32px] px-10 py-[60px] text-center cursor-pointer transition-all duration-[1200ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${isEntered ? 'flex-[1.1]' : 'flex-1'}`}
            style={{ transitionDelay: '800ms', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <div className="text-[40px] font-bold text-[#9999a2] mb-8 text-center">
              After
            </div>
            <ul className="list-none mb-8">
              {afterList.map((item, index) => (
                <li key={index} className="text-2xl font-medium leading-[160%] mb-4 text-center text-white">
                  {item}
                </li>
              ))}
            </ul>
            <div className="text-2xl text-[#9999a2] my-6 text-center">↓</div>
            <div className="text-[32px] font-bold text-center text-white">
              전략에 집중하는 리더
            </div>
          </div>
        </div>
      </div>
      <ScrollIndicator targetId="section8" />
    </div>
  );
};

export default Section7;