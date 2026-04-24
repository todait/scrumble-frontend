'use client';

import { useEffect } from 'react';

import landingHtml from '../static/landing.html?raw';

// ---------------------------------------------------------------------------
// 새 정적 랜딩 HTML을 빌드 타임에 raw 텍스트로 import 한 뒤,
//   - <head> 의 <link>/<style>
//   - <body> 콘텐츠 (단, <script> 는 분리)
// 으로 쪼개어 dangerouslySetInnerHTML 로 SSR 시점에 그대로 출력한다.
//
// dangerouslySetInnerHTML 안의 <script> 는 브라우저 보안상 실행되지 않으므로,
// 추출한 인라인 스크립트는 useEffect 에서 createElement('script') 로 수동 주입.
//
// 페이지 언마운트 시 주입한 스크립트 노드와 모달 잔존 상태 (body overflow) 를 정리한다.
// ---------------------------------------------------------------------------

const HEAD_INNER =
  landingHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';

const BODY_INNER_RAW =
  landingHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';

const INLINE_SCRIPTS = [
  ...landingHtml.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi),
].map((m) => m[1]);

const BODY_INNER = BODY_INNER_RAW.replace(
  /<script\b[\s\S]*?<\/script>/gi,
  '',
);

const STATIC_HTML = HEAD_INNER + BODY_INNER;

const LandingPage = () => {
  useEffect(() => {
    const injected: HTMLScriptElement[] = [];

    INLINE_SCRIPTS.forEach((code) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      const script = document.createElement('script');
      script.textContent = trimmed;
      script.dataset.landingInline = 'true';
      document.body.appendChild(script);
      injected.push(script);
    });

    return () => {
      injected.forEach((node) => node.remove());
      // 모달이 열린 상태에서 라우팅된 경우의 잔존 스크롤 잠금 해제
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      data-landing="scrumble-static"
      dangerouslySetInnerHTML={{ __html: STATIC_HTML }}
    />
  );
};

export default LandingPage;
