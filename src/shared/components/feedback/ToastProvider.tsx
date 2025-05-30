'use client';

import { useToastStore } from '@/shared/stores/toast.store';

import { ToastContainer } from './Toast';

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}