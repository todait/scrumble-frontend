const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="w-full px-[60px]">
        <div className="flex items-center justify-between h-[88px]">
          {/* Logo */}
          <div className="w-[144px] h-[48px] bg-[#E5E7EB] rounded-md"></div>
          
          {/* Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-[48px] absolute left-1/2 transform -translate-x-1/2">
            <a href="#problem" className="text-[#1D1D1F] hover:text-[#1D1D1F]/80 text-[20px] font-bold leading-[24px]">
              문제
            </a>
            <a href="#solution" className="text-[#1D1D1F] hover:text-[#1D1D1F]/80 text-[20px] font-bold leading-[24px]">
              솔루션
            </a>
            <a href="#pricing" className="text-[#1D1D1F] opacity-50 text-[20px] font-bold leading-[24px] cursor-not-allowed">
              가격(준비중)
            </a>
            <a href="#impact" className="text-[#1D1D1F] hover:text-[#1D1D1F]/80 text-[20px] font-bold leading-[24px]">
              인팩트
            </a>
          </nav>
          
          {/* CTA Button */}
          <button className="px-[32px] py-[14px] bg-[#111827] text-white rounded-full text-[16px] font-medium leading-[24px] hover:bg-gray-800 transition-colors">
            클로즈베타 신청하기
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;