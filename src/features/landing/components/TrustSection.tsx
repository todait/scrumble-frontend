'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const TrustSection = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  // Placeholder logos - replace with actual logos
  const partnerLogos = [
    { name: 'Company 1', placeholder: '🏢' },
    { name: 'Company 2', placeholder: '🚀' },
    { name: 'Company 3', placeholder: '💼' },
    { name: 'Company 4', placeholder: '🌟' },
    { name: 'Company 5', placeholder: '⚡' },
    { name: 'Company 6', placeholder: '🎯' },
  ];

  return (
    <section ref={ref} className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            함께 성장하는 파트너들
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            이미 많은 팀들이 Scrumble과 함께하고 있습니다
          </p>
        </motion.div>

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16"
        >
          {partnerLogos.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
              className="flex items-center justify-center"
            >
              <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
                <span className="text-4xl">{partner.placeholder}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: '회의 시간이 정말 80% 줄었어요. 이제 팀원들과 더 의미있는 대화를 나눕니다.',
              author: '스타트업 A사 CTO',
              role: '개발팀 15명',
            },
            {
              quote: '팀원들의 번아웃을 미리 감지하고 케어할 수 있게 되었습니다.',
              author: 'IT기업 B사 팀리드',
              role: '프로덕트팀 8명',
            },
            {
              quote: '도입 첫 주부터 팀 분위기가 달라졌어요. 진짜 일에 집중할 수 있게 됐습니다.',
              author: '에이전시 C사 대표',
              role: '전사 25명',
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg"
            >
              <div className="text-[#9747FF] text-3xl mb-4">&ldquo;</div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {testimonial.quote}
              </p>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {testimonial.author}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-6"
        >
          {[
            '🔒 ISO 27001 준비중',
            '🛡️ 데이터 암호화',
            '✅ GDPR 준수',
            '🚀 99.9% 가동률',
          ].map((badge, index) => (
            <span
              key={index}
              className="px-6 py-3 bg-white dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-semibold shadow-md"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;