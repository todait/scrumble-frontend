import type { Metadata } from 'next';
import LandingPageWrapper from '@/features/landing/pages/LandingPageWrapper';

export const metadata: Metadata = {
  title: 'Scrumble - 관리 시간을 절반으로, 리더십에 집중하세요',
  description: '매일 반복되는 팀 관리를 1분 체크인으로 해결. 회의 시간 80% 단축, 팀 상태 실시간 파악, 데이터 기반 의사결정으로 진짜 리더십에 집중하세요.',
  keywords: '스크럼, 데일리 스탠드업, 팀 관리, 체크인, 팀 협업, 프로젝트 관리, 리더십, 번아웃 예방, 팀 커뮤니케이션',
  openGraph: {
    title: 'Scrumble - 관리 시간을 절반으로, 리더십에 집중하세요',
    description: '매일 반복되는 팀 관리를 1분 체크인으로 해결. 선착순 10팀 클로즈베타 모집 중!',
    url: 'https://scrumble.io',
    siteName: 'Scrumble',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scrumble - 팀 관리의 새로운 방법',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scrumble - 관리 시간을 절반으로',
    description: '매일 반복되는 팀 관리를 1분 체크인으로 해결. 클로즈베타 모집 중!',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://scrumble.io',
  },
  verification: {
    google: 'google-site-verification-code',
    other: {
      'naver-site-verification': 'naver-verification-code',
    },
  },
};

export default function Landing() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Scrumble',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: '팀 관리를 자동화하고 리더십에 집중할 수 있도록 돕는 팀 협업 도구',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW',
              description: '베타 기간 무료',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '10',
            },
            featureList: [
              '1분 체크인',
              '팀 대시보드',
              '자동 리포트',
              '실시간 알림',
              'Slack 연동',
            ],
            screenshot: 'https://scrumble.io/screenshots/dashboard.png',
            softwareVersion: 'Beta',
            datePublished: '2024-01-01',
            publisher: {
              '@type': 'Organization',
              name: 'Scrumble Team',
              url: 'https://scrumble.io',
            },
          }),
        }}
      />
      <LandingPageWrapper />
    </>
  );
}