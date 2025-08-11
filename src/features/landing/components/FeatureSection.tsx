'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiUserCheck, FiCheckCircle, FiLayout, FiFileText } from 'react-icons/fi';

const features = [
  {
    icon: <FiUserCheck className="w-8 h-8" />,
    title: '1분 체크인',
    description: '팀원 상태와 업무 상황을\n빠르고 자연스럽게 파악',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <FiCheckCircle className="w-8 h-8" />,
    title: '투두 및 체크아웃',
    description: '업무 완료까지 흐름을 놓치지 않고\n안정적으로 관리',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <FiLayout className="w-8 h-8" />,
    title: '팀 대시보드',
    description: '진척도와 분위기를 한눈에 확인\n놓치는 순간없이 즉각 대응',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <FiFileText className="w-8 h-8" />,
    title: '리포트 자동화',
    description: '데이터 기반 인사이트\n1:1 케어와 전략적 의사결정 지원',
    color: 'from-orange-500 to-red-500',
  },
];

const FeatureSection = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-24 px-6 bg-gradient-to-br from-purple-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            관리가 아니라 리더십을.
          </h2>
          <p className="text-xl md:text-2xl text-gray-600">
            팀을 움직이는 본질에 집중하세요.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white rounded-3xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 shadow-lg border border-purple-100/50">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {feature.description}
                </p>
              </div>
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
          <p className="text-lg text-gray-600">
            모든 기능이{' '}
            <span className="font-bold text-[#9747FF]">자동화</span>되어
            리더는 오직{' '}
            <span className="font-bold text-[#9747FF]">의사결정</span>에만
            집중할 수 있습니다
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;