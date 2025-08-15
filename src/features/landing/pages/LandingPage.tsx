'use client';

import { useEffect, useState } from 'react';
import BeforeAfterSection from '../components/BeforeAfterSection';
import BenefitsSection from '../components/BenefitsSection';
import BetaForm from '../components/BetaForm';
import CTASection from '../components/CTASection';
import ContrastSection from '../components/ContrastSection';
import FeatureSection from '../components/FeatureSection';
import IntroSection from '../components/IntroSection';
import ROISection from '../components/ROISection';
import StickyCTA from '../components/StickyCTA';

const LandingPage = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setShowStickyCTA(scrollPercentage > 30);

      // Form 섹션이 보이는지 체크
      const formElement = document.getElementById('beta-form');
      if (formElement) {
        const rect = formElement.getBoundingClientRect();
        setIsFormVisible(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    document.getElementById('beta-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <IntroSection onCTAClick={scrollToForm} />

      {/* Value Proposition */}
      <CTASection onCTAClick={scrollToForm} />

      {/* Contrast Section */}
      <ContrastSection />

      {/* Features Grid */}
      <FeatureSection />

      {/* Benefits */}
      <BenefitsSection onCTAClick={scrollToForm} />

      {/* Before/After */}
      <BeforeAfterSection />

      {/* ROI Calculator */}
      <ROISection />

      {/* Beta Form */}
      <BetaForm />

      {/* Sticky CTA */}
      {showStickyCTA && !isFormVisible && <StickyCTA onClick={scrollToForm} />}
    </div>
  );
};

export default LandingPage;
