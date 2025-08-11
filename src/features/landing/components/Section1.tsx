import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ScrollIndicator from './ScrollIndicator';

const textData = [
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

interface EmojiPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
}

interface EmojiItem {
  emoji: string;
  position: EmojiPosition;
  size: number;
}

const Section1 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);

  const getRandomPosition = (index: number) => {
    // 텍스트 박스 주변에 이모지 배치
    // 첫 번째(index 0)는 왼쪽, 두 번째(index 1)는 오른쪽

    const isLeft = index === 0;

    // 수직 위치 옵션 (위, 중간, 아래)
    const verticalOptions = [
      { top: '-200px' }, // 텍스트 위
      { top: '10px' }, // 텍스트 중간
      { bottom: '-200px' }, // 텍스트 아래
    ];

    const verticalPos = verticalOptions[Math.floor(Math.random() * verticalOptions.length)];
    const randomOffset = Math.random() * 30 - 15; // ±15px

    const position: EmojiPosition = {};

    // 수직 위치 설정
    if (verticalPos.top) {
      position.top = `calc(${verticalPos.top} + ${randomOffset}px)`;
    }
    if (verticalPos.bottom) {
      position.bottom = `calc(${verticalPos.bottom} + ${randomOffset}px)`;
    }

    // 수평 위치 설정 (왼쪽 또는 오른쪽)
    if (isLeft) {
      // 왼쪽: 텍스트 박스 왼쪽에 위치
      position.left = `${-150 + Math.random() * 30}px`; // -150px ~ -120px
    } else {
      // 오른쪽: 텍스트 박스 오른쪽에 위치
      position.left = `calc(100% + ${30 + Math.random() * 30}px)`; // 100% + 30px ~ 60px
    }

    return position;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % textData.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentEmojis = textData[currentIndex].emojis;
    const position1 = getRandomPosition(0); // 첫 번째 이모지 (주로 왼쪽)
    const position2 = getRandomPosition(1); // 두 번째 이모지 (주로 오른쪽)

    // 첫 번째 이모지 크기 생성 (64px ~ 160px)
    const randomSize1 = Math.floor(Math.random() * (160 - 64 + 1)) + 64;

    // 두 번째 이모지 크기 생성
    let randomSize2;
    if (randomSize1 <= 120) {
      // 첫 번째가 120px 이하면, 두 번째는 (첫번째+40)px ~ 160px
      const minSize2 = Math.min(randomSize1 + 40, 160);
      randomSize2 = Math.floor(Math.random() * (160 - minSize2 + 1)) + minSize2;
    } else {
      // 첫 번째가 120px 초과면, 일반 랜덤 (64px ~ 160px)
      randomSize2 = Math.floor(Math.random() * (160 - 64 + 1)) + 64;
    }

    setEmojis([
      { emoji: currentEmojis[0], position: position1, size: randomSize1 },
      { emoji: currentEmojis[1], position: position2, size: randomSize2 },
    ]);
  }, [currentIndex]);


  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#F3F3F3] px-10 py-20 text-center">
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Title */}
        <h1 className="mb-8 text-[54px] font-bold tracking-[-0.02em] text-[#1d1d1f]">
          오늘도 어김없이
        </h1>

        {/* Rolling Container with Emojis */}
        <div className="relative mb-12 inline-block">
          {/* Emojis - 텍스트 박스 주변에 위치 */}
          {emojis.map((item, idx) => (
            <div
              key={`${currentIndex}-${idx}`}
              className="animate-jelly-in pointer-events-none absolute"
              style={{
                ...item.position,
                fontSize: `${item.size}px`,
                opacity: 0,
                animation: 'jellyIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                animationDelay: idx === 0 ? '0.2s' : '0.5s',
              }}
            >
              {item.emoji}
            </div>
          ))}

          <motion.div
            className="rounded-[20px] bg-white px-20 py-10"
            layout
            transition={{
              layout: { duration: 0.5, type: 'spring', stiffness: 300, damping: 30 },
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="whitespace-nowrap text-center text-[60px] font-black leading-[1.4] tracking-[-0.01em] text-[#1d1d1f]"
              >
                {textData[currentIndex].text}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Question */}
        <p className="mb-16 text-center text-[54px] font-bold text-[#1d1d1f]">하루가 끝났나요?</p>

        <ScrollIndicator targetId="section2" />
      </div>

      <style jsx>{`
        @keyframes jellyIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          60% {
            opacity: 1;
            transform: scale(1.1);
          }
          80% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Section1;
