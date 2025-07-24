import type { Metadata, Viewport } from 'next';

import { getFontClassNames } from '@/shared/lib/fonts';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Scrumble',
  description: 'AI 시대에 잃어가는 인간적 연결을 업무 환경에서 되찾자',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Scrumble',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/logo.svg', sizes: 'any', type: 'image/svg+xml' }],
    apple: [{ url: '/logo.svg' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={getFontClassNames()}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
