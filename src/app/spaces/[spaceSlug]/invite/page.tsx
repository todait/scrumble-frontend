'use client';

import React from 'react';

import { InviteSpacePage } from '@/features/space/pages';
import { withAuth } from '@/shared/components/auth';
import { useAuth } from '@/shared/contexts/AuthContext';

interface InviteSpacePageRouteProps {
  params: Promise<{
    spaceSlug: string;
  }>;
}

function InviteSpacePageRoute({ params }: InviteSpacePageRouteProps) {
  const { spaceSlug } = React.use(params);
  const { currentSpace } = useAuth();

  // currentSpace가 아직 로드되지 않았거나, 다른 스페이스일 경우
  if (!currentSpace || currentSpace.slug !== spaceSlug) {
    return <div>로딩 중...</div>;
  }

  return <InviteSpacePage spaceSlug={spaceSlug} spaceName={currentSpace.name} />;
}

export default withAuth(InviteSpacePageRoute);
