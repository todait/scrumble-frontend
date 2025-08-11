'use client';

interface ScrollIndicatorProps {
  targetId: string;
}

const ScrollIndicator = ({ targetId }: ScrollIndicatorProps) => {
  const scrollToNext = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 transform">
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