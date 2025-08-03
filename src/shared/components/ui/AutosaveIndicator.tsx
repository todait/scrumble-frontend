'use client';

import type { AutosaveStatus } from '@/shared/services/autosave';
import { RiCheckLine, RiLoader4Line, RiErrorWarningLine } from '@remixicon/react';
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
          icon: <RiLoader4Line className="h-4 w-4 animate-spin" />,
          color: 'text-gray-500',
        };
      case 'saved':
        return {
          icon: <RiCheckLine className="h-4 w-4" />,
          color: 'text-green-600',
        };
      case 'error':
        return {
          icon: <RiErrorWarningLine className="h-4 w-4" />,
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
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className={`${display.color} ${className}`}
      >
        {display.icon}
      </motion.div>
    </AnimatePresence>
  );
};