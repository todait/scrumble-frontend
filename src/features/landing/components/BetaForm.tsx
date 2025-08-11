'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const BetaForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    teamSize: '',
    companyName: '',
    currentTools: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    if (!formData.teamSize) {
      newErrors.teamSize = '팀 규모를 선택해주세요';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <section id="beta-form" className="py-24 px-6 bg-[#9747FF]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-8xl mb-8"
          >
            🎉
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            신청이 완료되었습니다!
          </h2>
          <p className="text-xl text-white/90 mb-8">
            입력하신 이메일로 상세 안내를 보내드렸습니다.
            <br />
            24시간 이내에 온보딩 일정을 잡아드릴게요.
          </p>
          <button
            className="px-8 py-4 bg-white text-[#9747FF] font-bold text-lg rounded-full hover:bg-gray-100 transition-all"
          >
            처음으로 돌아가기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="beta-form" ref={ref} className="py-24 px-6 bg-gradient-to-br from-[#9747FF] to-[#8338EC]">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            클로즈베타 신청하기
          </h2>
          <p className="text-xl text-white/90">
            선착순 10팀만 모집합니다. 지금 신청하세요!
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl"
        >
          {/* Email */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#9747FF]`}
              placeholder="leader@company.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Team Size */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              팀 규모 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.teamSize}
              onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.teamSize ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#9747FF]`}
            >
              <option value="">선택해주세요</option>
              <option value="2-5">2-5명</option>
              <option value="6-10">6-10명</option>
              <option value="11-20">11-20명</option>
              <option value="21-50">21-50명</option>
              <option value="50+">50명 이상</option>
            </select>
            {errors.teamSize && (
              <p className="text-red-500 text-sm mt-1">{errors.teamSize}</p>
            )}
          </div>

          {/* Company Name (Optional) */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              회사/팀명 <span className="text-gray-400 text-sm">(선택)</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9747FF]"
              placeholder="스크럼블 팀"
            />
          </div>

          {/* Current Tools (Optional) */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              현재 사용 중인 툴 <span className="text-gray-400 text-sm">(선택)</span>
            </label>
            <input
              type="text"
              value={formData.currentTools}
              onChange={(e) => setFormData({ ...formData, currentTools: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9747FF]"
              placeholder="슬랙, 노션, 지라..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#9747FF] hover:bg-[#8338EC] text-white transform hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? '신청 중...' : '클로즈베타테스터 신청하기'}
          </button>

          {/* Trust Messages */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>✓ 신용카드 불필요</p>
            <p>✓ 언제든 철회 가능</p>
            <p>✓ 베타 기간 완전 무료</p>
          </div>
        </motion.form>

        {/* Beta Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-white"
        >
          <h3 className="text-xl font-semibold mb-4">베타 테스터 혜택</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
              ✨ 우선 온보딩 지원
            </span>
            <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
              💬 전용 지원 채널
            </span>
            <span className="px-4 py-2 bg-white/20 rounded-full text-sm">
              💰 정식 출시 후 50% 할인
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BetaForm;