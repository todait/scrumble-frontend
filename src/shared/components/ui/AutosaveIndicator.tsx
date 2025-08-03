'use client';

import type { AutosaveStatus } from '@/shared/services/autosave';
import { RiCheckLine, RiLoader4Line } from '@remixicon/react';
import { AnimatePresence, motion } from 'framer-motion';

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  className?: string;
}

export const AutosaveIndicator = ({ status, className = '' }: AutosaveIndicatorProps) => {
  if (status === 'idle' || status === 'restored') return null;

  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <RiLoader4Line className="h-3 w-3 animate-spin" />,
          text: '자동 저장 중...',
          color: 'text-gray-500',
        };
      case 'saved':
        return {
          icon: <RiCheckLine className="h-3 w-3" />,
          text: '저장됨',
          color: 'text-green-600',
        };
      case 'error':
        return {
          icon: null,
          text: '저장 실패',
          color: 'text-red-600',
        };
      default:
        return null;
    }
  };

  const display = getStatusDisplay();
  if (!display) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center gap-1 text-xs ${display.color} ${className}`}
      >
        {display.icon}
        <span>{display.text}</span>
      </motion.div>
    </AnimatePresence>
  );
};