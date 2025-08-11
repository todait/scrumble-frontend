'use client';

import { useState } from 'react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationModal = ({ isOpen, onClose }: ApplicationModalProps) => {
  const [formData, setFormData] = useState({
    teamName: '',
    teamSize: '',
    tools: [] as string[],
    otherTools: '',
    difficulties: '',
    experience: '',
    expectations: '',
    email: '',
    additional: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const teamSizeOptions = ['3-5', '6-10', '11-15', '16-24', '25-40', '40명 이상'];
  const toolOptions = ['Slack', 'Teams', '잔디', 'Notion', 'Jira', 'Asana'];

  const handleTeamSizeClick = (size: string) => {
    setFormData({ ...formData, teamSize: size });
  };

  const handleToolClick = (tool: string) => {
    const newTools = formData.tools.includes(tool)
      ? formData.tools.filter((t) => t !== tool)
      : [...formData.tools, tool];
    setFormData({ ...formData, tools: newTools });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return (
      formData.teamName.trim() !== '' &&
      formData.teamSize !== '' &&
      formData.difficulties.trim() !== '' &&
      formData.expectations.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.additional.trim() !== ''
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setFormData({
        teamName: '',
        teamSize: '',
        tools: [],
        otherTools: '',
        difficulties: '',
        experience: '',
        expectations: '',
        email: '',
        additional: '',
      });
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#f5f5f7] rounded-xl w-full max-w-[500px] max-h-[90vh] flex flex-col animate-modal-slide-in">
        {/* Header */}
        <div className="px-8 py-8 border-b border-[#e0e0e0] flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isSubmitted ? (
              <span className="text-[#1d1d1f]">클로즈베타테스터 신청 완료</span>
            ) : (
              <>
                <span className="text-[#8c4bf9]">스크럼블</span>
                <span className="text-[#1d1d1f]"> 클로즈베타테스터 신청</span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-[#9999a2] hover:text-[#6e6e73] transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          {!isSubmitted ? (
            <>
              <div className="text-sm text-[#9999a2] mb-5 leading-relaxed">
                팀 관리의 어려움과 니즈를 파악하여 더 나은 제품을 만들고자 합니다.
                <br />
                신청 정보는 제품 개발과 베타 테스트 운영 목적으로만 사용됩니다. 테스터 선정 후 메일로
                연락드리겠습니다. 감사합니다.
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Team Name */}
                <div>
                  <label className="block mb-3 font-semibold text-[#1d1d1f] text-base">
                    팀 또는 회사 이름
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl text-base bg-white outline-none transition-all text-[#1d1d1f] placeholder:text-[#9999a2]"
                    required
                  />
                </div>

                {/* Team Size */}
                <div>
                  <label className="block mb-3 font-semibold text-[#1d1d1f] text-base">팀 규모</label>
                  <div className="flex flex-wrap gap-3">
                    {teamSizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleTeamSizeClick(size)}
                        className={`px-5 py-3 rounded-xl text-base transition-all whitespace-nowrap ${
                          formData.teamSize === size
                            ? 'bg-[#8c4bf9] text-white shadow-[inset_0_0_0_6px_rgba(255,255,255,0.2)]'
                            : 'bg-white text-[#9999a2] hover:text-[#8c4bf9]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <label className="block mb-3 font-semibold text-[#1d1d1f] text-base">
                    현재 사용중인 협업 도구 (모두 선택 가능)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {toolOptions.map((tool) => (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => handleToolClick(tool)}
                        className={`px-5 py-3 rounded-xl text-base transition-all whitespace-nowrap ${
                          formData.tools.includes(tool)
                            ? 'bg-[#8c4bf9] text-white shadow-[inset_0_0_0_6px_rgba(255,255,255,0.2)]'
                            : 'bg-white text-[#9999a2] hover:text-[#8c4bf9]'
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Tools */}
                <div>
                  <label className="block mb-3 font-semibold text-[#1d1d1f] text-base">
                    기타 도구가 있다면 알려주세요
                  </label>
                  <input
                    type="text"
                    name="otherTools"
                    value={formData.otherTools}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl text-base bg-white outline-none transition-all text-[#1d1d1f] placeholder:text-[#9999a2]"
                  />
                </div>

                {/* Difficulties */}
                <div>
                  <label className="block mb-3 font-semibold text-[#1d1d1f] text-base">
                    팀 관리 시 가장 큰 어려움은?
                  </label>
                  <textarea
                    name="difficulties"
                    value={formData.difficulties}
                    onChange={handleInputChange}
                    placeholder="예: 체크인 미팅시 너무 많은 시간 소요"
                    className="w-full px-5 py-4 rounded-xl text-base bg-white outline-none transition-all text-[#1d1d1f] placeholder:text-[#9999a2] min-h-[100px] resize-vertical"
                    required
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block mb-3 font-semibold text-[#1d1d1f] text-base">
                    팀원 바이오/티사 경험
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl text-base bg-white outline-none transition-all text-[#1d1d1f] placeholder:text-[#9999a2] min-h-[100px] resize-vertical"
                  />
                </div>

                {/* Expectations */}
                <div>
                  <label className="block mb-3 font-semibold text-base">
                    <span className="text-[#8c4bf9]">스크럼블</span>
                    <span className="text-[#1d1d1f]">에서 가장 기대하는 기능은?</span>
                  </label>
                  <textarea
                    name="expectations"
                    value={formData.expectations}
                    onChange={handleInputChange}
                    placeholder="예: 팀원들의 컨디션을 한방에 확인"
                    className="w-full px-5 py-4 rounded-xl text-base bg-white outline-none transition-all text-[#1d1d1f] placeholder:text-[#9999a2] min-h-[100px] resize-vertical"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-3 font-semibold text-[#1d1d1f] text-base">
                    연락 가능한 이메일 주소
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl text-base bg-white outline-none transition-all text-[#1d1d1f] placeholder:text-[#9999a2]"
                    required
                  />
                </div>

                {/* Additional */}
                <div>
                  <label className="block mb-3 font-semibold text-[#1d1d1f] text-base">
                    담당자님 성함
                  </label>
                  <input
                    type="text"
                    name="additional"
                    value={formData.additional}
                    onChange={handleInputChange}
                    placeholder="성함 또는 닉네임을 알려주세요"
                    className="w-full px-5 py-4 rounded-xl text-base bg-white outline-none transition-all text-[#1d1d1f] placeholder:text-[#9999a2]"
                    required
                  />
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-10">
              <div className="text-base leading-[160%]">
                <span className="text-[#8c4bf9] font-bold">{formData.additional}</span>
                <span className="text-[#9999a2] font-bold">님 감사합니다!</span>
                <br />
                <span className="text-[#8c4bf9] font-bold">{formData.email}</span>
                <span className="text-[#9999a2] font-bold">
                  로 빠른 시일 내에 클로즈베타테스터 선정 안내를 보내드리겠습니다.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSubmitted && (
          <div className="px-8 py-8 border-t border-[#e0e0e0]">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                isFormValid()
                  ? 'bg-[#8c4bf9] text-white hover:bg-[#7a3de8] cursor-pointer'
                  : 'bg-[#8c4bf9] text-white opacity-20 cursor-not-allowed'
              }`}
            >
              신청서 제출하기
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modal-slide-in {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-slide-in {
          animation: modal-slide-in 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ApplicationModal;