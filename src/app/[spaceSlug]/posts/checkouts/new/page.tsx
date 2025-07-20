'use client';

import { withAuth } from '@/shared/components/auth';
import { PageLoadingSpinner } from '@/shared/components/ui';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

const CheckOutWriteModal = dynamic(
  () => import('@/features/checkout/components').then(mod => mod.CheckOutWriteModal),
  { 
    ssr: false,
    loading: () => <PageLoadingSpinner />
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

  return <CheckOutWriteModal spaceSlug={spaceSlug} isOpen={isModalOpen} onClose={handleClose} />;
}

export default withAuth(CheckOutNewPage);
