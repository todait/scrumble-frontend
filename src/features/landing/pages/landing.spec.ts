import { expect, test } from '@playwright/test';

test('Landing matches Desktop design', async ({ page }) => {
  // 1440px 너비로 viewport 설정 (높이는 fullPage 옵션 때문에 상관없음)
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/landing');

  // 페이지가 완전히 로드될 때까지 대기
  await page.waitForLoadState('networkidle');

  // 모든 이미지가 로드될 때까지 추가 대기 (필요시)
  await page.waitForTimeout(1000);

  await expect(page).toHaveScreenshot('Desktop.png', {
    fullPage: true, // 전체 페이지 스크롤 포함 캡처
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixels: 100, // 약간의 차이 허용 (선택사항)
  });
});
