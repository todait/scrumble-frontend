'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface CTASectionProps {
  onCTAClick: () => void;
}

const CTASection = ({ onCTAClick }: CTASectionProps) => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const TEAM_LIMIT = 10;

  return (
    <section ref={ref} className="py-24 px-6 bg-white border-y border-gray-100">
      <div className="max-w-5xl mx-auto text-center">
        {/* Limited Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-full mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          베타 한정 초대 • 선착순 {TEAM_LIMIT}팀
        </motion.div>

        {/* Main Value Proposition */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
        >
          Scrumble로 관리 시간을{' '}
          <span className="text-[#9747FF] underline decoration-wavy decoration-2 underline-offset-4">
            절반으로
          </span>{' '}
          줄이고,
        </motion.h2>
        
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-3xl md:text-5xl font-bold text-gray-700 mb-12"
        >
          팀 리더 본연의 역할에 집중하세요.
        </motion.h3>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto"
        >
          {[
            { value: '50%', label: '관리 시간 절감' },
            { value: '1분', label: '팀 상태 파악' },
            { value: '80%', label: '회의 시간 단축' },
            { value: '2x', label: '집중 시간 확보' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#9747FF] mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={onCTAClick}
            className="px-10 py-5 bg-[#9747FF] hover:bg-[#8338EC] text-white font-bold text-xl rounded-full transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            클로즈베타테스터 신청하기
          </button>
          <p className="mt-4 text-sm text-gray-500">
            신용카드 불필요 • 언제든 철회 가능
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;