'use client';

import { withAuth } from '@/shared/components/auth';
import { dynamicWithGlobalLoading } from '@/shared/utils/dynamicWithGlobalLoading';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

const CheckOutWriteModal = dynamicWithGlobalLoading(
  () => import('@/features/checkout/components').then(mod => mod.CheckOutWriteModal),
  {
    ssr: false,
    loadingMessage: '체크아웃 작성 로딩 중...',
  }
);

interface CheckOutNewPageProps {
  params: Promise<{ spaceSlug: string }>;
}

function CheckOutNewPage({ params }: CheckOutNewPageProps) {
  const { spaceSlug } = use(params);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push(`/${spaceSlug}/feed`);
  };

  return <CheckOutWriteModal isOpen={isModalOpen} onClose={handleClose} />;
}

export default withAuth(CheckOutNewPage);
