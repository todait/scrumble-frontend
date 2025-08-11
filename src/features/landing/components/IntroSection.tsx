'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const rollingMessages = [
  { text: '장황한 회의만 하다가', emojis: ['😵‍💫', '😅'] },
  { text: '팀원들 상태 확인하다가', emojis: ['😯', '👀'] },
  { text: '일일이 확인하려 다니다가', emojis: ['😬', '😞'] },
  { text: '중요한 일은 또 밀리다가', emojis: ['😬', '😞'] },
  { text: '팀의 온도를 모르고', emojis: ['😖', '😵‍💫'] },
  { text: '팀원의 표정만 살피다', emojis: ['😥', '😯'] },
  { text: '지쳐버린 마음으로', emojis: ['😭', '😖'] },
  { text: '리더십 발휘는 언데간데 없이', emojis: ['😰', '😵'] },
  { text: '누군가의 신호를 놓친채', emojis: ['🤯', '😞'] },
];

interface IntroSectionProps {
  onCTAClick: () => void;
}

const IntroSection = ({ onCTAClick }: IntroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLastMessage, setIsLastMessage] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % rollingMessages.length;
        setIsLastMessage(next === rollingMessages.length - 1);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-6 py-20">
      <div className="mx-auto max-w-6xl text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-4xl font-bold text-gray-900 md:text-5xl"
        >
          오늘도 어김없이...
        </motion.h1>

        {/* Rolling Messages with Emojis */}
        <div className="relative mb-6 h-24 md:h-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                ...(isLastMessage && {
                  x: [0, -2, 2, -2, 0],
                  transition: {
                    x: {
                      duration: 0.5,
                      delay: 1.5,
                      ease: 'easeInOut',
                    },
                  },
                }),
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex items-center gap-4">
                <span className="whitespace-nowrap text-5xl font-semibold text-gray-700 md:text-6xl">
                  {rollingMessages[currentIndex].text}
                </span>
                <div className="flex shrink-0 gap-2">
                  {rollingMessages[currentIndex].emojis.map((emoji, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: idx * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
                      className="text-4xl md:text-5xl"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Question */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-8 text-4xl font-bold text-gray-900 md:text-5xl"
        >
          하루가 끝났나요?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl text-xl text-gray-600 md:text-2xl"
        >
          관리하느라 리더십을 못 쓰는 순간, 팀은 신호를 보냅니다.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex justify-center"
        >
          <button
            onClick={onCTAClick}
            className="transform rounded-full bg-[#9747FF] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#8338EC] hover:shadow-xl"
          >
            클로즈베타테스터 신청하기
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 transform"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex h-10 w-6 justify-center rounded-full border-2 border-gray-400"
          >
            <div className="mt-2 h-3 w-1 rounded-full bg-gray-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default IntroSection;
