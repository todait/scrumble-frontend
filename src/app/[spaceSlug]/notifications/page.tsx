import { Metadata } from 'next';
import { NotificationPageWrapper } from './NotificationPageWrapper';

interface NotificationPageProps {
  params: Promise<{
    spaceSlug: string;
  }>;
}

export const metadata: Metadata = {
  title: '알림',
  description: '팀 활동 알림과 공지사항을 확인하세요.',
  robots: 'noindex, nofollow',
};

export default async function NotificationPageComponent({ params }: NotificationPageProps) {
  const { spaceSlug } = await params;
  return <NotificationPageWrapper spaceSlug={spaceSlug} />;
}