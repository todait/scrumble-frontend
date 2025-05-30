import { SettingsLayout } from '@/features/settings/components/layout';

export default async function SettingsLayoutPage({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  return (
    <SettingsLayout spaceId={spaceId}>
      {children}
    </SettingsLayout>
  );
} 