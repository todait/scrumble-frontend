'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ContrastSection = () => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-24 px-6 bg-gradient-to-b from-slate-50 to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Before Card - 관리 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200">
              <div className="text-gray-400 text-sm font-semibold mb-4">BEFORE</div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-400 mb-6">
                관리 대신
              </h3>
              <p className="text-xl text-gray-500 mb-8">
                끝없는 확인과 보고서 작성에 하루가 사라집니다
              </p>
              <ul className="space-y-3 text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✗</span> 매일 반복되는 상태 체크
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✗</span> 보고를 위한 보고서 작성
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✗</span> 팀원 일정 수동 추적
                </li>
              </ul>
            </div>
          </motion.div>

          {/* After Card - 전략 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-[#9747FF] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-white rounded-3xl p-8 md:p-12 border-2 border-[#9747FF]/20 shadow-xl">
              <div className="text-[#9747FF] text-sm font-semibold mb-4">AFTER</div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                <span className="text-[#9747FF]">전략에</span>
              </h3>
              <p className="text-xl text-gray-700 mb-8">
                핵심 의사결정과 팀 성장에 집중할 수 있습니다
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 자동화된 팀 상태 대시보드
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 인사이트 기반 의사결정
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 실시간 팀 활동 추적
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-12">
          {/* Before Card - 보고 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gray-200 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200">
              <div className="text-gray-400 text-sm font-semibold mb-4">BEFORE</div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-400 mb-6">
                보고 대신
              </h3>
              <p className="text-xl text-gray-500 mb-8">
                형식적인 보고서에 창의성이 묻힙니다
              </p>
              <ul className="space-y-3 text-gray-500">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✗</span> 주간 보고서 작성 2시간
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✗</span> 중복되는 정보 수집
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✗</span> 실시간성 없는 데이터
                </li>
              </ul>
            </div>
          </motion.div>

          {/* After Card - 결정 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-[#9747FF] rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-white rounded-3xl p-8 md:p-12 border-2 border-[#9747FF]/20 shadow-xl">
              <div className="text-[#9747FF] text-sm font-semibold mb-4">AFTER</div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                <span className="text-[#9747FF]">결정에 집중</span>
              </h3>
              <p className="text-xl text-gray-700 mb-8">
                데이터 기반의 빠른 의사결정이 가능합니다
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 자동 생성되는 리포트
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 실시간 팀 인사이트
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 즉각적인 피드백 루프
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContrastSection;