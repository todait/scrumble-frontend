'use client';

import { motion } from 'framer-motion';

interface StickyCTAProps {
  onClick: () => void;
}

const StickyCTA = ({ onClick }: StickyCTAProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:block">
          <p className="text-lg font-semibold text-gray-900">
            🚀 선착순 10팀만 모집 중
          </p>
          <p className="text-sm text-gray-600">
            베타 기간 완전 무료 · 언제든 철회 가능
          </p>
        </div>
        
        <button
          onClick={onClick}
          className="w-full md:w-auto px-8 py-3 bg-[#9747FF] hover:bg-[#8338EC] text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl animate-pulse"
        >
          클로즈베타테스터 신청하기
        </button>
      </div>
    </motion.div>
  );
};

export default StickyCTA;