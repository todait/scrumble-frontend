'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/shared/components/auth';
import { CheckOutWriteModal } from '@/features/checkout/components';

interface CheckOutNewPageProps {
  params: Promise<{ spaceId: string }>;
}

function CheckOutNewPage({ params }: CheckOutNewPageProps) {
  const { spaceId } = use(params);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push(`/${spaceId}/feed`);
  };

  return <CheckOutWriteModal isOpen={isModalOpen} onClose={handleClose} />;
}

export default withAuth(CheckOutNewPage);