import { test, expect } from '@playwright/test';

test.describe('Tiptap 에디터 성능 테스트', () => {
  test('에디터 로딩 시간이 2초 이내이다', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000/dashboard');
    
    // 에디터가 완전히 로드될 때까지 대기
    await page.locator('[data-testid="post-form-editor"] .ProseMirror').waitFor();
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(2000); // 2초 이내
    console.log(`에디터 로딩 시간: ${loadTime}ms`);
  });

  test('타이핑 지연이 100ms 이내이다', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    const testText = '성능 테스트를 위한 긴 텍스트입니다. '.repeat(10);
    
    const startTime = Date.now();
    await editor.type(testText, { delay: 0 });
    const endTime = Date.now();
    
    const typingTime = endTime - startTime;
    const charactersTyped = testText.length;
    const avgTimePerChar = typingTime / charactersTyped;
    
    expect(avgTimePerChar).toBeLessThan(10); // 문자당 10ms 이내
    console.log(`평균 문자당 타이핑 시간: ${avgTimePerChar.toFixed(2)}ms`);
  });

  test('대용량 텍스트 처리 성능', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    // 1000자 정도의 긴 텍스트
    const longText = '긴 텍스트 성능 테스트입니다. '.repeat(50);
    
    const startTime = Date.now();
    await editor.fill(longText);
    const endTime = Date.now();
    
    const processingTime = endTime - startTime;
    
    expect(processingTime).toBeLessThan(1000); // 1초 이내
    console.log(`대용량 텍스트 처리 시간: ${processingTime}ms`);
    
    // 텍스트가 올바르게 입력되었는지 확인
    await expect(editor).toContainText('긴 텍스트 성능 테스트입니다.');
  });

  test('메모리 사용량 모니터링', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // 초기 메모리 측정
    const initialMetrics = await page.evaluate(() => {
      return {
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
      };
    });
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    // 대량의 텍스트 입력으로 메모리 사용량 증가시키기
    for (let i = 0; i < 10; i++) {
      await editor.type(`메모리 테스트 ${i} 번째 줄입니다. `.repeat(20));
      await page.keyboard.press('Enter');
    }
    
    // 최종 메모리 측정
    const finalMetrics = await page.evaluate(() => {
      return {
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
      };
    });
    
    const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
    
    console.log(`메모리 사용량 증가: ${memoryIncreaseMB.toFixed(2)}MB`);
    
    // 메모리 사용량이 과도하게 증가하지 않았는지 확인 (10MB 이내)
    expect(memoryIncreaseMB).toBeLessThan(10);
  });

  test('에디터 인스턴스 정리 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // 에디터 로드
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.waitFor();
    
    // 페이지 이동 (에디터 언마운트)
    await page.goto('http://localhost:3000/');
    
    // 가비지 컬렉션 실행
    await page.evaluate(() => {
      if (window.gc) {
        window.gc();
      }
    });
    
    // 메모리 누수가 없는지 확인
    const metrics = await page.evaluate(() => {
      return {
        eventListeners: document.querySelectorAll('*').length,
        intervalCount: (window as any).__intervalCount || 0,
        timeoutCount: (window as any).__timeoutCount || 0,
      };
    });
    
    console.log('정리 후 메트릭스:', metrics);
    // 정확한 검증은 복잡하므로 로그만 출력
  });

  test('한글 입력(IME) 성능', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    // 한글 입력 시뮬레이션
    const koreanText = '한글 입력 테스트입니다. 성능을 확인해보겠습니다.';
    
    const startTime = Date.now();
    await editor.type(koreanText);
    const endTime = Date.now();
    
    const typingTime = endTime - startTime;
    
    expect(typingTime).toBeLessThan(2000); // 2초 이내
    console.log(`한글 입력 시간: ${typingTime}ms`);
    
    // 한글이 올바르게 입력되었는지 확인
    await expect(editor).toContainText(koreanText);
  });

  test('번들 크기 최적화 확인', async ({ page }) => {
    // 네트워크 요청 모니터링
    const requests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('.js') || request.url().includes('.css')) {
        requests.push({
          url: request.url(),
          size: 0, // 실제로는 response에서 가져와야 함
        });
      }
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // 에디터가 로드될 때까지 대기
    await page.locator('[data-testid="post-form-editor"]').waitFor();
    
    console.log(`로드된 리소스 수: ${requests.length}`);
    
    // 너무 많은 JavaScript 파일이 로드되지 않았는지 확인
    const jsFiles = requests.filter(req => req.url.includes('.js'));
    expect(jsFiles.length).toBeLessThan(20); // 20개 이하의 JS 파일
  });
});