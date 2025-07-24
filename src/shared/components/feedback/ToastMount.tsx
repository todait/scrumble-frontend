'use client';

import { createPortal } from 'react-dom';
import { ToastContainer } from './Toast';
import { useToastStore } from '../../stores/toast.store';
import { useEffect, useState } from 'react';

export function ToastMount() {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 클라이언트 사이드에서만 렌더링
  if (!mounted || typeof document === 'undefined') return null;
  
  // 토스트가 없으면 포털도 생성하지 않음
  if (toasts.length === 0) return null;

  return createPortal(
    <ToastContainer toasts={toasts} onClose={removeToast} />,
    document.body
  );
}