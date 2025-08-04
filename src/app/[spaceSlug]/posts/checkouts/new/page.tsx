'use client';

import { CheckOutWriteModal } from '@/features/checkout';
import { withAuth } from '@/shared/components/auth';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

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
