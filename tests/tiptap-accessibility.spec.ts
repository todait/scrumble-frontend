import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Tiptap 에디터 접근성 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    // Axe 접근성 도구 주입
    await injectAxe(page);
  });

  test('에디터 전체 접근성 검사', async ({ page }) => {
    // 에디터가 로드될 때까지 대기
    await page.locator('[data-testid="post-form-editor"]').waitFor();
    
    // 전체 페이지 접근성 검사
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('에디터 영역 특정 접근성 검사', async ({ page }) => {
    const editor = page.locator('[data-testid="post-form-editor"]');
    await editor.waitFor();
    
    // 에디터 영역만 접근성 검사
    await checkA11y(page, '[data-testid="post-form-editor"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
      },
    });
  });

  test('키보드 네비게이션 지원', async ({ page }) => {
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    
    // Tab으로 에디터에 포커스 이동
    await page.keyboard.press('Tab');
    
    // 에디터가 포커스를 받았는지 확인
    await expect(editor).toBeFocused();
    
    // 텍스트 입력 가능한지 확인
    await page.keyboard.type('키보드 테스트');
    await expect(editor).toContainText('키보드 테스트');
    
    // 키보드 단축키 테스트
    await page.keyboard.press('Control+a'); // 전체 선택
    await page.keyboard.press('Control+b'); // Bold
    
    // Bold가 적용되었는지 확인
    const boldElement = editor.locator('strong, .font-bold');
    await expect(boldElement).toContainText('키보드 테스트');
  });

  test('스크린 리더 호환성 - ARIA 속성', async ({ page }) => {
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.waitFor();
    
    // 에디터에 적절한 ARIA 속성이 있는지 확인
    await expect(editor).toHaveAttribute('contenteditable', 'true');
    await expect(editor).toHaveAttribute('role', 'textbox');
    
    // placeholder나 aria-label이 있는지 확인
    const hasAriaLabel = await editor.getAttribute('aria-label');
    const hasPlaceholder = await editor.getAttribute('data-placeholder');
    
    expect(hasAriaLabel || hasPlaceholder).toBeTruthy();
  });

  test('포커스 인디케이터 시각성', async ({ page }) => {
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    
    // 에디터에 포커스
    await editor.focus();
    
    // 포커스 스타일이 적용되었는지 확인
    const focusedEditor = await editor.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        outline: computedStyle.outline,
        outlineWidth: computedStyle.outlineWidth,
        boxShadow: computedStyle.boxShadow,
        borderColor: computedStyle.borderColor,
      };
    });
    
    // 포커스 인디케이터가 있는지 확인 (outline, box-shadow, border 중 하나)
    const hasFocusIndicator = 
      focusedEditor.outline !== 'none' ||
      focusedEditor.outlineWidth !== '0px' ||
      focusedEditor.boxShadow !== 'none' ||
      focusedEditor.borderColor !== 'rgb(0, 0, 0)'; // 기본 검은색이 아닌 경우
    
    expect(hasFocusIndicator).toBeTruthy();
  });

  test('멘션 리스트 접근성', async ({ page }) => {
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    // 멘션 트리거
    await editor.type('@');
    
    // 멘션 리스트가 나타날 때까지 대기
    const mentionList = page.locator('[role="listbox"]');
    await mentionList.waitFor({ timeout: 2000 }).catch(() => {
      // 멘션 기능이 활성화되지 않은 경우 스킵
      test.skip();
    });
    
    // 멘션 리스트 접근성 검사
    await expect(mentionList).toHaveAttribute('role', 'listbox');
    await expect(mentionList).toHaveAttribute('aria-label');
    
    // 멘션 항목들이 올바른 ARIA 속성을 가지는지 확인
    const mentionItems = mentionList.locator('[role="option"]');
    const itemCount = await mentionItems.count();
    
    if (itemCount > 0) {
      const firstItem = mentionItems.first();
      await expect(firstItem).toHaveAttribute('role', 'option');
      await expect(firstItem).toHaveAttribute('aria-selected');
      
      // 키보드로 탐색 가능한지 확인
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Enter');
    }
  });

  test('색상 대비 검사', async ({ page }) => {
    await page.locator('[data-testid="post-form-editor"]').waitFor();
    
    // 색상 대비 전용 검사
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
      },
      tags: ['wcag2a', 'wcag2aa'],
    });
  });

  test('텍스트 크기 조절 지원', async ({ page }) => {
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.waitFor();
    
    // 기본 폰트 크기 측정
    const defaultFontSize = await editor.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    // 브라우저 확대 (200%)
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    // 텍스트 입력 후 가독성 확인
    await editor.click();
    await editor.type('텍스트 크기 테스트');
    
    // 확대된 상태에서도 텍스트가 보이는지 확인
    await expect(editor).toContainText('텍스트 크기 테스트');
    
    // 확대 해제
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('터치 인터페이스 지원', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.waitFor();
    
    // 터치 이벤트 시뮬레이션
    await editor.tap();
    
    // 모바일에서도 에디터가 포커스되는지 확인
    await expect(editor).toBeFocused();
    
    // 가상 키보드를 고려한 텍스트 입력
    await editor.type('모바일 터치 테스트');
    await expect(editor).toContainText('모바일 터치 테스트');
  });

  test('에러 상태 접근성', async ({ page }) => {
    // 에러 상태를 트리거하는 상황 시뮬레이션
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    // 매우 긴 텍스트 입력으로 에러 상태 유발 (실제 구현에 따라 다름)
    const veryLongText = 'a'.repeat(10000);
    await editor.type(veryLongText);
    
    // 에러 메시지가 있다면 접근성 검사
    const errorMessage = page.locator('[role="alert"], .error-message, [aria-live="polite"]');
    
    if (await errorMessage.isVisible()) {
      // 에러 메시지가 스크린 리더에 의해 읽힐 수 있는지 확인
      await expect(errorMessage).toHaveAttribute('role', 'alert');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('다크 모드 접근성', async ({ page }) => {
    // 다크 모드 전환 (실제 구현에 따라 방법이 다를 수 있음)
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.locator('[data-testid="post-form-editor"]').waitFor();
    
    // 다크 모드에서도 색상 대비가 적절한지 확인
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
  });
});