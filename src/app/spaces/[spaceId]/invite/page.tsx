'use client';

import React from 'react';

import { InviteSpacePage } from '@/features/space/pages';
import { withAuth } from '@/shared/components/auth';

interface InviteSpacePageRouteProps {
  params: Promise<{
    spaceSlug: string;
  }>;
}

function InviteSpacePageRoute({ params }: InviteSpacePageRouteProps) {
  const { spaceSlug } = React.use(params);

  return (
    <InviteSpacePage
      spaceSlug={spaceSlug}
      spaceName="스크럼블 팀" // 추후 API로 spaceSlug를 통해 실제 스페이스 이름을 가져올 예정
    />
  );
}

export default withAuth(InviteSpacePageRoute);
