'use client';

import React from 'react';
import { InviteSpacePage } from '@/features/space/pages';

interface InviteSpacePageRouteProps {
  params: Promise<{
    spaceId: string;
  }>;
}

export default function InviteSpacePageRoute({ params }: InviteSpacePageRouteProps) {
  const { spaceId } = React.use(params);

  return (
    <InviteSpacePage 
      spaceId={spaceId}
      spaceName="스크럼블 팀" // 추후 API로 spaceId를 통해 실제 스페이스 이름을 가져올 예정
    />
  );
} 