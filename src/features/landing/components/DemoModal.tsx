'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlay } from 'react-icons/fi';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-[50%] -translate-y-[50%] md:inset-x-auto md:left-[50%] md:-translate-x-[50%] max-w-4xl w-full z-[101]"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  1분 데모 영상
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {/* Video Placeholder */}
              <div className="aspect-video bg-gray-100 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-[#9747FF] rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-[#8338EC] transition-colors">
                    <FiPlay className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-gray-600">
                    데모 영상이 준비 중입니다
                  </p>
                </div>
              </div>
              
              {/* Demo Screenshots */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  주요 기능 미리보기
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: '체크인', emoji: '✅' },
                    { title: '대시보드', emoji: '📊' },
                    { title: '리포트', emoji: '📈' },
                    { title: '알림', emoji: '🔔' },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 text-center"
                    >
                      <div className="text-4xl mb-2">{feature.emoji}</div>
                      <p className="text-sm font-medium text-gray-700">
                        {feature.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* CTA */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-[#9747FF] hover:bg-[#8338EC] text-white font-bold rounded-xl transition-colors"
                >
                  지금 바로 시작하기
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DemoModal;