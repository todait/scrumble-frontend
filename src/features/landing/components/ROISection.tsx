'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const roiTabs = [
  {
    label: '단축',
    title: '회의시간 80% 단축',
    description: '30분 스탠드업을 1분 체크인으로.\n더 많은 시간을 \'진짜 일\'에 씁니다.',
    note: '*8명 팀 기준 연 4.2억 절감 효과',
    emoji: '⏱️',
    highlight: '80%',
  },
  {
    label: '집중',
    title: '금쪽같은 집중시간 2배 확보',
    description: '확인하느라 DM도, 슬랙 뒤지기도 끝.\n덕분에 집중 흐름이 끊기지 않습니다',
    note: '',
    emoji: '🎯',
    highlight: '2배',
  },
  {
    label: '향상',
    title: '업무효율 60% 향상',
    description: '보고를 위한 보고를 위한 작업은 최소로\n실질 업무에 몰입, 성과로 이어가세요',
    note: '',
    emoji: '📈',
    highlight: '60%',
  },
  {
    label: '절감',
    title: '프로젝트 예산 15% 절감',
    description: '일정 지연 신호를 미리 포착\n추가 비용이 생기기 전에 발빠른 대응',
    note: '*개발자 한 명만 지켜도 1.2억 원 손실 예방',
    emoji: '💰',
    highlight: '15%',
  },
  {
    label: '포착',
    title: '팀원의 번아웃 조기 감지',
    description: '팀원의 컨디션 변화를 데이터로 추적\n팀을 잃지 않는 가장 빠른 방법입니다.',
    note: '',
    emoji: '🛡️',
    highlight: '조기',
  },
  {
    label: '소통',
    title: '자연스러운 소통 팀 에너지 개선',
    description: '실시간으로 확인하는 우리 팀원들의 컨디션\n이제 팀의 온도를 한눈에 읽으세요',
    note: '',
    emoji: '💬',
    highlight: '팀',
  },
];

const ROISection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    if (!isAutoPlaying || !inView) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % roiTabs.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, inView]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section ref={ref} className="py-24 px-6 bg-gradient-to-br from-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            팀의 운영, 더 스마트하게.
            <br />
            더 많은 시간을 <span className="text-[#9747FF]">&apos;진짜 일&apos;</span>에.
          </h2>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {roiTabs.map((tab, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => handleTabClick(index)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === index
                  ? 'bg-[#9747FF] text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
              className="w-full max-w-5xl"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
                {/* Left Content */}
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    {roiTabs[activeTab].title.split(' ').map((word, i) => (
                      <span key={i}>
                        {i > 0 && ' '}
                        {word === roiTabs[activeTab].highlight ? (
                          <span className="text-[#9747FF]">{word}</span>
                        ) : (
                          word
                        )}
                      </span>
                    ))}
                  </h3>
                  <p className="text-xl text-gray-600 mb-4 whitespace-pre-line">
                    {roiTabs[activeTab].description}
                  </p>
                  {roiTabs[activeTab].note && (
                    <p className="text-sm text-gray-500 italic">
                      {roiTabs[activeTab].note}
                    </p>
                  )}
                </div>

                {/* Right Visual */}
                <div className="flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-8xl md:text-9xl"
                  >
                    {roiTabs[activeTab].emoji}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ROISection;