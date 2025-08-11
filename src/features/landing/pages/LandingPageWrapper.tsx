'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import IntroSection from '../components/IntroSection';
import CTASection from '../components/CTASection';
import ContrastSection from '../components/ContrastSection';
import FeatureSection from '../components/FeatureSection';
import BenefitsSection from '../components/BenefitsSection';
import BeforeAfterSection from '../components/BeforeAfterSection';
import ROISection from '../components/ROISection';
import BetaForm from '../components/BetaForm';

// Dynamic imports for better performance
const StickyCTA = dynamic(() => import('../components/StickyCTA'), {
  ssr: false,
});

const DemoModal = dynamic(() => import('../components/DemoModal'), {
  ssr: false,
});

const LandingPageWrapper = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

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

    // 초기 스크롤 체크
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  const scrollToForm = () => {
    if (typeof window !== 'undefined') {
      document.getElementById('beta-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <IntroSection onCTAClick={scrollToForm} onDemoClick={() => setIsDemoModalOpen(true)} />
      
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
      
      {/* Sticky CTA - Only render on client */}
      {isMounted && showStickyCTA && !isFormVisible && (
        <Suspense fallback={null}>
          <StickyCTA onClick={scrollToForm} />
        </Suspense>
      )}
      
      {/* Demo Modal - Only render on client */}
      {isMounted && (
        <Suspense fallback={null}>
          <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
        </Suspense>
      )}
    </main>
  );
};

export default LandingPageWrapper;