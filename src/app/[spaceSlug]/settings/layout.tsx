'use client';

import { SettingsLayout } from '@/features/settings/components/layout';
import { use } from 'react';

export default function SettingsLayoutPage({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ spaceSlug: string }>;
}) {
  const { spaceSlug } = use(params);
  return <SettingsLayout spaceSlug={spaceSlug}>{children}</SettingsLayout>;
}
