'use client';

interface ScrollIndicatorProps {
  currentSection: number;
  totalSections: number;
}

const ScrollIndicator = ({ currentSection, totalSections }: ScrollIndicatorProps) => {
  const scrollToNext = () => {
    const sections = ['section1', 'section2', 'section4', 'section5', 'section6', 'section7', 'section8'];
    
    if (currentSection < totalSections - 1) {
      const nextSection = sections[currentSection + 1];
      document.getElementById(nextSection)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 마지막 섹션에서는 인디케이터 숨김
  if (currentSection >= totalSections - 1) {
    return null;
  }

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 transform z-50">
      <button
        onClick={scrollToNext}
        className="group flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-110 hover:bg-[#3498db]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#666"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:stroke-white"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default ScrollIndicator;