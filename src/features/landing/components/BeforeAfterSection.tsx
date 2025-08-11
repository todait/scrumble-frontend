'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const beforeList = [
  '매일 팀원 상황 확인에 시간 소모',
  '프로젝트 이슈를 늦게 발견',
  '리더십 대신 관리 업무에 갇힘',
  '팀 분위기 파악에 근거 부족',
  '번아웃을 퇴사 통보로서야 알게 됨',
];

const afterList = [
  '팀 상황을 빠르게 한눈에 파악',
  '빠른 이슈 감지와 즉각 대응 가능',
  '전략과 팀 케어에 집중하는 리더십 발휘',
  '데이터 기반으로 팀 상태와 분위기 관리',
  '지속적인 케어로 팀원 번아웃 예방',
];

const BeforeAfterSection = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-24 px-6 bg-gradient-to-b from-amber-50/50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            어제와는 다른 리더의 하루를 만드세요.
          </h2>
        </motion.div>

        {/* Before/After Cards */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 0.5, x: 0 } : {}}
            whileHover={{ opacity: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gray-100 rounded-3xl p-8 md:p-10 h-full">
              <div className="text-red-500 text-sm font-bold uppercase tracking-wider mb-4">
                Before
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-500 mb-8">
                관리가 전부인 리더
              </h3>
              
              <ul className="space-y-4">
                {beforeList.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-red-400 text-xl mt-1">😔</span>
                    <span className="text-gray-600 text-lg">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 1 }}
                className="mt-8 text-center"
              >
                <div className="text-3xl text-gray-400">↓</div>
                <p className="text-gray-500 font-medium mt-2">
                  결과: 소진되는 리더, 정체된 팀
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#9747FF]/10 to-[#8338EC]/10 rounded-3xl p-8 md:p-10 h-full border-2 border-[#9747FF]/20">
              <div className="text-[#9747FF] text-sm font-bold uppercase tracking-wider mb-4">
                After
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                전략에 집중하는 리더
              </h3>
              
              <ul className="space-y-4">
                {afterList.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-green-500 text-xl mt-1">✨</span>
                    <span className="text-gray-700 text-lg font-medium">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="mt-8 text-center"
              >
                <div className="text-3xl text-[#9747FF]">↓</div>
                <p className="text-[#9747FF] font-bold mt-2 text-lg">
                  결과: 성장하는 리더, 몰입하는 팀
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center mt-16"
        >
          <p className="text-xl text-gray-600">
            단 하루만 사용해도 차이를 느낄 수 있습니다.
            <br />
            <span className="font-bold text-[#9747FF]">
              지금 시작하면 다음 주부터 변화가 시작됩니다.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;