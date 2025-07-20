'use client';

import { useToastStore } from '@/shared/stores/toast.store';
import dynamic from 'next/dynamic';
import { PageLoadingSpinner } from '../ui';

const ToastContainer = dynamic(
  () => import('./Toast').then(mod => mod.ToastContainer),
  { 
    ssr: false,
    loading: () => <PageLoadingSpinner />
  }
);

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  // 토스트가 없으면 컴포넌트를 렌더링하지 않음
  if (toasts.length === 0) return null;

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}