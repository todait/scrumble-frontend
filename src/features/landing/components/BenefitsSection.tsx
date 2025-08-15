'use client';

import { motion } from 'framer-motion';
import { FiClock, FiEye, FiFileText, FiHeart, FiLink, FiTrendingUp } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';

interface BenefitsSectionProps {
  onCTAClick: () => void;
}

const benefits = [
  {
    icon: <FiFileText className="h-6 w-6" />,
    title: '장황한 회의, 체크인으로 대체',
    problem: '매일 30분씩 진행되는 스탠드업 미팅',
    solution: '팀원 1분 작성, 리더는 대시보드 확인으로 끝',
  },
  {
    icon: <FiEye className="h-6 w-6" />,
    title: '개인 할일이 팀에게 투명하게',
    problem: '누가 뭘 하는지 일일이 물어봐야 하는 상황',
    solution: '누가 뭘 하고 있는지 투명하게 보여요',
  },
  {
    icon: <FiTrendingUp className="h-6 w-6" />,
    title: '추측 그만, 데이터 기반 팀 관리',
    problem: '감으로 하는 팀 관리, 문제 발생 후 대응',
    solution: '주간/월간 활동 패턴과 완료율을 객관적으로',
  },
  {
    icon: <FiHeart className="h-6 w-6" />,
    title: '팀원 케어 타이밍도 발빠르게',
    problem: '번아웃 신호를 놓치고 퇴사 통보받는 상황',
    solution: '위험 신호를 빠르게 케어',
  },
  {
    icon: <FiClock className="h-6 w-6" />,
    title: '상황 체크에 쏟는 시간, 초단축',
    problem: '슬랙, 이메일, DM 확인하며 하루가 끝남',
    solution: '대시보드만 보면 모든 팀원을 한눈에 파악',
  },
  {
    icon: <FiLink className="h-6 w-6" />,
    title: '기존 툴과 자연스럽게 연동',
    problem: '새로운 툴 도입에 대한 팀원들의 저항',
    solution: '팀원 설득 비용 제로, Scrumble만 살짝 추가',
  },
];

const BenefitsSection = ({ onCTAClick }: BenefitsSectionProps) => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="bg-white px-6 py-24 border-y border-gray-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
            깊어지는 리더의 시간,
            <br />
            <span className="text-[#9747FF]">가벼워지는</span> 팀의 움직임.
          </h2>
        </motion.div>

        {/* Benefits Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#9747FF]/10 text-[#9747FF]">
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="mb-4 text-xl font-bold text-gray-900">{benefit.title}</h3>

              {/* Problem → Solution */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg text-red-400">✗</span>
                  <p className="text-sm text-gray-500 line-through">{benefit.problem}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg text-green-500">✓</span>
                  <p className="text-sm font-medium text-gray-700">{benefit.solution}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="rounded-3xl bg-[#9747FF]/10 p-8 text-center md:p-12"
        >
          <h3 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
            더 이상 팀 관리에 시간을 빼앗기지 마세요
          </h3>
          <p className="mb-8 text-gray-600">
            지금 신청하면 무료로 베타 테스트에 참여할 수 있습니다
          </p>
          <button
            onClick={onCTAClick}
            className="transform rounded-full bg-[#9747FF] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#8338EC] hover:shadow-xl"
          >
            클로즈베타테스터 신청하기
          </button>
          <p className="mt-4 text-sm text-gray-500">
            선착순 10팀 한정 • 남은 자리 얼마 안 남았어요
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
