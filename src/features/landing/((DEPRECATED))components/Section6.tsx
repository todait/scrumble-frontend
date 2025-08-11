'use client';

import { useEffect, useRef, useState } from 'react';
import { FiFileText, FiEye, FiTrendingUp, FiHeart, FiClock, FiLink } from 'react-icons/fi';

const benefits = [
  {
    icon: <FiFileText />,
    title: '장황한 회의, 체크인으로 대체',
    description: '길어지기 일쑤인 아침 회의를 체크인으로 대체해요. 팀원 1분 작성, 리더는 대시보드 확인으로 끝이에요.',
    highlights: ['체크인으로 대체해요', '팀원 1분 작성', '대시보드 확인으로 끝이에요'],
  },
  {
    icon: <FiEye />,
    title: '개인 할일이 팀에게 투명하게',
    description: '팀원들이 스스로 진행상황을 공유하니까 일일이 확인하러 다닐 필요가 없어요. 누가 뭘 하고 있는지 투명하게 보여요.',
    highlights: ['스스로 진행상황을 공유하니까', '투명하게 보여요'],
  },
  {
    icon: <FiTrendingUp />,
    title: '추측 그만, 데이터 기반 팀 관리',
    description: '팀 관리 근거가 생겨요. 주간/월간 활동 패턴과 완료율을 데이터로 보면서 객관적으로 팀을 이끌 수 있어요.',
    highlights: ['주간/월간 활동 패턴과 완료율', '객관적으로 팀을 이끌 수 있어요'],
  },
  {
    icon: <FiHeart />,
    title: '팀원 케어 타이밍도 발빠르게',
    description: '팀원이 힘들어하거나 체크인을 빼먹으면 리더에게 즉시 알림이 와요. 소중한 팀원의 위험 신호를 빠르게 케어하세요',
    highlights: ['즉시 알림이 와요', '빠르게 케어하세요'],
  },
  {
    icon: <FiClock />,
    title: '상황 체크에 쏟는 시간, 초단축',
    description: '"요즘 어때?" 묻는 시간이 완전히 사라져요. 대시보드만 보면 모든 팀원의 컨디션과 활동을 한눈에 파악할 수 있어요.',
    highlights: ['완전히 사라져요', '한눈에 파악할 수 있어요'],
  },
  {
    icon: <FiLink />,
    title: '기존 툴과 자연스럽게 연동',
    description: '팀원 설득 비용 제로예요. 기존에 쓰던 슬랙, 잔디, 카카오워크 그대로 두고 Scrumble만 살짝 추가하면 끝이에요.',
    highlights: ['팀원 설득 비용 제로예요', 'Scrumble만 살짝 추가하면 끝이에요'],
  },
];

const Section6 = () => {
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

  const highlightText = (text: string, highlights: string[]) => {
    let result = text;
    highlights.forEach((highlight) => {
      result = result.replace(
        highlight,
        `<span class="${isEntered ? 'text-[#6e6e73]' : 'text-[#9999a2]'} font-bold transition-all duration-300">${highlight}</span>`
      );
    });
    return result;
  };

  return (
    <div
      id="section6"
      ref={sectionRef}
      className="w-full py-[120px] px-10 bg-white"
    >
      <div
        className={`bg-[#f5f5f7] transition-all duration-400 ${
          isEntered ? 'mx-20 rounded-[32px]' : 'mx-0'
        } py-[140px]`}
        onMouseEnter={() => setIsEntered(true)}
        onMouseLeave={() => setIsEntered(false)}
      >
        <div className="w-full max-w-[1440px] mx-auto px-10">
          <div
            className={`text-[40px] font-bold text-[#1d1d1f] mb-16 text-left leading-[160%] max-w-[1200px] mx-auto transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            깊어지는 리더의 시간,
            <br />
            가벼워지는 팀의 움직임.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1200px] mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`bg-white rounded-[20px] p-8 text-left transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(0,0,0,0.15)] flex flex-col justify-center min-h-[200px] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br from-[#8c4bf9] to-[#b478f7] rounded-[20px] flex items-center justify-center mb-6 transition-all duration-300 ${
                    isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                >
                  <div className="text-white text-[28px]">{benefit.icon}</div>
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-3 leading-[160%]">
                  {benefit.title}
                </h3>
                <p
                  className="text-sm font-bold text-[#9999a2] leading-[160%] transition-all duration-300"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(benefit.description, benefit.highlights),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section6;