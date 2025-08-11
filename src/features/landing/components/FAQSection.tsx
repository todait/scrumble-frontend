'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiChevronDown } from 'react-icons/fi';

const faqs = [
  {
    question: '팀원들이 또 써야 하나요?',
    answer: '걱정 마세요! Scrumble은 기존 툴과 연동되어 팀원 설득 비용이 제로입니다. 슬랙, 잔디, 카카오워크 등 이미 사용 중인 메신저에 살짝 추가하기만 하면 됩니다.',
  },
  {
    question: '우리 팀은 회의 문화가 중요한데요?',
    answer: '1분 체크인은 회의를 대체하는 것이 아니라 더 전략적으로 만듭니다. 상태 공유는 자동화하고, 회의 시간엔 오직 중요한 의사결정에만 집중할 수 있습니다.',
  },
  {
    question: '데이터 보안이 걱정돼요',
    answer: '모든 데이터는 암호화되어 저장되며, ISO 27001 인증을 준비 중입니다. 언제든 데이터 삭제 요청이 가능하고, 접근 권한도 세밀하게 관리할 수 있습니다.',
  },
  {
    question: '도입이 어렵지 않나요?',
    answer: '5분이면 설정 완료! 복잡한 온보딩 없이 바로 시작할 수 있습니다. 전담 CS팀이 초기 세팅부터 팀 적응까지 밀착 지원합니다.',
  },
  {
    question: '가격은 어떻게 되나요?',
    answer: '베타 기간 동안은 완전 무료입니다. 정식 출시 후에도 베타 참여팀에게는 특별 할인 혜택을 제공할 예정입니다.',
  },
  {
    question: '우리 팀 규모에도 맞나요?',
    answer: '2명부터 200명까지 모든 규모의 팀에서 사용 가능합니다. 팀 규모에 따라 최적화된 기능과 대시보드를 제공합니다.',
  },
  {
    question: '효과를 어떻게 측정하나요?',
    answer: 'Scrumble 자체 분석 대시보드로 도입 전후 변화를 명확히 확인할 수 있습니다. 회의 시간 감소, 팀 활성도 증가 등 구체적인 지표를 제공합니다.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="py-24 px-6 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            자주 묻는 질문
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            도입 전 궁금하신 점들을 모았습니다
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <FiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            더 궁금한 점이 있으신가요?
          </p>
          <a
            href="mailto:support@scrumble.io"
            className="text-[#9747FF] hover:text-[#8338EC] font-semibold underline"
          >
            support@scrumble.io로 문의주세요
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;