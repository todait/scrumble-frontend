'use client';

import { useEffect, useRef, useState } from 'react';

const tabData = [
  {
    label: '단축',
    subtitle: '회의시간 80% 단축',
    description: '30분 스탠드업을 1분 체크인으로.\n더 많은 시간을 \'진짜 일\'에 씁니다.',
    note: '*8명 팀 기준 연 4.2억을 절감 효과',
    emoji: '👥',
  },
  {
    label: '집중',
    subtitle: '금쪽같은 집중시간 2배 확보',
    description: '확인하느라 DM도, 슬랙 뒤지기도 끝.\n덕분에 집중 흐름이 끊기지 않습니다',
    note: '',
    emoji: '💻',
  },
  {
    label: '향상',
    subtitle: '업무효율 60% 향상',
    description: '보고를 위한 보고를 위한 작업은 최소로\n실질 업무에 몰입, 성과로 이어가세요',
    note: '',
    emoji: '👨‍👩‍👧',
  },
  {
    label: '절감',
    subtitle: '프로젝트 예산 15% 절감',
    description: '일정 지연 신호를 미리 포착\n추가 비용이 새기 전에 발빠른 대응',
    note: '*개발자 한 명만 지켜도 1.2 억 원 손실 예방',
    emoji: '🤝',
  },
  {
    label: '포착',
    subtitle: '팀원의 번아웃 조기 감지',
    description: '일정 지연 신호를 미리 포착\n팀을 잃지 않는 가장 빠른 방법입니다.',
    note: '',
    emoji: '👨‍👩‍👧‍👦',
  },
  {
    label: '소통',
    subtitle: '자연스러운 소통 팀 에너지 개선',
    description: '실시간으로 확인하는 우리 팀원들의 컨디션\n이제 팀의 온도를 한눈에 읽으세요',
    note: '',
    emoji: '👥',
  },
];

const Section8 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          if (entry.isIntersecting) {
            startTabRotation();
          } else {
            stopTabRotation();
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
      stopTabRotation();
    };
  }, []);

  const startTabRotation = () => {
    stopTabRotation();
    intervalRef.current = setInterval(() => {
      if (!isTransitioning) {
        setCurrentTab((prev) => (prev + 1) % tabData.length);
      }
    }, 6000);
  };

  const stopTabRotation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleTabClick = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    stopTabRotation();
    setCurrentTab(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
      startTabRotation();
    }, 5000);
  };

  return (
    <div
      id="section8"
      ref={sectionRef}
      className="w-full py-[120px] px-10 bg-[#f5f5f7]"
    >
      <div className="w-full max-w-[1440px] mx-auto">
        <div
          className={`text-[40px] font-bold text-[#1d1d1f] text-center mb-16 leading-[160%] transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          팀의 운영, 더 아무지게.
          <br />더 많은 시간을 &apos;진짜 일&apos;에.
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-5 mb-16 flex-wrap">
          {tabData.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`px-6 py-3 rounded-[25px] text-base font-semibold cursor-pointer transition-all duration-300 whitespace-nowrap ${
                currentTab === index
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#d1d1d6] text-[#6e6e73] hover:bg-[#c1c1c6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-[1000px] mx-auto min-h-[400px] flex items-center justify-center relative">
          {tabData.map((content, index) => (
            <div
              key={index}
              className={`absolute w-[calc(100%-80px)] bg-white rounded-[40px] p-10 flex items-center gap-[60px] transition-all duration-600 ${
                currentTab === index
                  ? 'opacity-100 translate-x-0 visible'
                  : 'opacity-0 translate-x-8 invisible'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="flex-1">
                <div className="text-2xl font-bold text-[#1d1d1f] mb-4 leading-[160%]">
                  {content.subtitle.split(' ').map((word, i) => {
                    const isHighlight = ['80%', '2배', '60%', '15%', '조기', '팀'].includes(word.replace(/[^0-9%가-힣]/g, ''));
                    return (
                      <span key={i}>
                        {i > 0 && ' '}
                        <span className={isHighlight ? 'text-[#8c4bf9]' : ''}>
                          {word}
                        </span>
                      </span>
                    );
                  })}
                </div>
                <div className="text-[32px] font-medium text-[#6e6e73] mb-4 leading-[160%] whitespace-pre-line">
                  {content.description}
                </div>
                {content.note && (
                  <div className="text-xl text-[#6e6e73]/50 italic">
                    {content.note}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 w-[300px] h-[300px] bg-[#e5e5ea] rounded-[20px] flex items-center justify-center text-[80px]">
                {content.emoji}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Section8;