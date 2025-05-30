import { SettingsLayout } from '@/features/settings/components/layout';

export default function SettingsLayoutPage({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { spaceId: string };
}) {
  return (
    <SettingsLayout spaceId={params.spaceId}>
      {children}
    </SettingsLayout>
  );
} 