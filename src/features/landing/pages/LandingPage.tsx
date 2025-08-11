'use client';

import { useEffect, useState } from 'react';
import ApplicationModal from '../components/ApplicationModal';
import CTASection from '../components/CTASection';
import Header from '../components/Header';
import IntroSection from '../components/IntroSection';
import ScrollIndicator from '../components/ScrollIndicator';
import Section4 from '../components/Section4';
import Section5 from '../components/Section5';
import Section6 from '../components/Section6';
import Section7 from '../components/Section7';
import Section8 from '../components/Section8';

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const sectionIds = [
      'section1',
      'section2',
      'section4',
      'section5',
      'section6',
      'section7',
      'section8',
    ];

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // 섹션의 50% 이상이 보일 때 활성화
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const index = sectionIds.indexOf(sectionId);
          if (index !== -1) {
            setCurrentSection(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 모든 섹션 관찰
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <IntroSection />
      <CTASection openModal={openModal} />
      <Section4 />
      <Section5 />
      <Section6 />
      <Section7 />
      <Section8 />
      <ApplicationModal isOpen={isModalOpen} onClose={closeModal} />
      <ScrollIndicator currentSection={currentSection} totalSections={7} />
    </div>
  );
};

export default LandingPage;
