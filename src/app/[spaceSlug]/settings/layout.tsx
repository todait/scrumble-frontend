import { SettingsLayout } from '@/features/settings/components/layout';

export default async function SettingsLayoutPage({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ spaceSlug: string }>;
}) {
  const { spaceSlug } = await params;
  return <SettingsLayout spaceSlug={spaceSlug}>{children}</SettingsLayout>;
}
