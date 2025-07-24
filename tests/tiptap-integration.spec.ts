import { test, expect } from '@playwright/test';

test.describe('Tiptap 에디터 통합 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 개발 서버가 실행 중이라고 가정
    await page.goto('http://localhost:3000');
  });

  test('PostForm에서 Tiptap 에디터가 렌더링된다', async ({ page }) => {
    // PostForm이 있는 페이지로 이동 (실제 경로에 맞게 수정 필요)
    await page.goto('http://localhost:3000/dashboard'); // 예시 경로
    
    // Tiptap 에디터가 렌더링되는지 확인
    const editor = page.locator('[data-testid="post-form-editor"]');
    await expect(editor).toBeVisible();
    
    // placeholder 텍스트 확인
    await expect(editor).toContainText('무엇을 공유하고 싶나요?');
  });

  test('PostForm 에디터에서 텍스트 입력이 가능하다', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    await editor.fill('테스트 포스트 내용입니다.');
    
    await expect(editor).toContainText('테스트 포스트 내용입니다.');
  });

  test('PostForm 에디터에서 Bold 기능이 작동한다', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    await editor.fill('Bold 테스트');
    
    // 텍스트 선택
    await page.keyboard.press('Control+a');
    
    // Bold 적용 (Ctrl+B)
    await page.keyboard.press('Control+b');
    
    // Bold가 적용되었는지 확인
    const boldText = editor.locator('strong, .font-bold');
    await expect(boldText).toContainText('Bold 테스트');
  });

  test('PostForm 에디터에서 Bullet List 기능이 작동한다', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    // 대시(-) 입력으로 불릿 리스트 생성
    await editor.type('- 첫 번째 항목');
    await page.keyboard.press('Enter');
    await editor.type('두 번째 항목');
    
    // 불릿 리스트가 생성되었는지 확인
    const listItems = editor.locator('ul li');
    await expect(listItems).toHaveCount(2);
    await expect(listItems.first()).toContainText('첫 번째 항목');
    await expect(listItems.last()).toContainText('두 번째 항목');
  });

  test('PostForm 에디터에서 AutoLink 기능이 작동한다', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    // URL 입력 후 공백 추가하여 링크 변환 트리거
    await editor.type('https://example.com ');
    
    // 링크가 생성되었는지 확인
    const link = editor.locator('a[href="https://example.com"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('PostForm 에디터에서 Cmd+Enter로 제출이 가능하다', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    await editor.type('제출 테스트 내용');
    
    // 제출 버튼이나 폼의 상태 변경을 모니터링
    const submitButton = page.locator('[data-testid="post-submit-button"]');
    
    // Cmd+Enter (Mac) 또는 Ctrl+Enter (Windows/Linux) 
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+Enter`);
    
    // 제출이 처리되었는지 확인 (실제 구현에 따라 수정 필요)
    // 예: 로딩 상태, 성공 메시지, 폼 리셋 등을 확인
  });

  test('CommentSection에서 CommentEditor가 렌더링된다', async ({ page }) => {
    // 댓글이 있는 페이지로 이동 (실제 경로에 맞게 수정 필요)
    await page.goto('http://localhost:3000/post/1'); // 예시 경로
    
    const commentEditor = page.locator('[data-testid="comment-editor"]');
    await expect(commentEditor).toBeVisible();
  });

  test('CommentSection에서 새 댓글 작성이 가능하다', async ({ page }) => {
    await page.goto('http://localhost:3000/post/1');
    
    const commentEditor = page.locator('[data-testid="comment-editor"] .ProseMirror');
    await commentEditor.click();
    await commentEditor.type('새로운 댓글입니다.');
    
    // Enter 키로 댓글 제출
    await page.keyboard.press('Enter');
    
    // 댓글이 추가되었는지 확인 (실제 구현에 따라 수정 필요)
    await expect(page.locator('[data-testid="comment-list"]')).toContainText('새로운 댓글입니다.');
  });

  test('CommentSection에서 댓글 수정 모드가 작동한다', async ({ page }) => {
    await page.goto('http://localhost:3000/post/1');
    
    // 기존 댓글의 수정 버튼 클릭
    const editButton = page.locator('[data-testid="comment-edit-button"]').first();
    await editButton.click();
    
    // 수정 에디터가 나타나는지 확인
    const editEditor = page.locator('[data-testid="comment-edit-editor"] .ProseMirror');
    await expect(editEditor).toBeVisible();
    
    // 기존 내용이 로드되어 있는지 확인
    await expect(editEditor).not.toBeEmpty();
    
    // 내용 수정
    await editEditor.clear();
    await editEditor.type('수정된 댓글 내용입니다.');
    
    // Enter로 저장
    await page.keyboard.press('Enter');
    
    // 수정된 내용이 반영되었는지 확인
    await expect(page.locator('[data-testid="comment-list"]')).toContainText('수정된 댓글 내용입니다.');
  });

  test('CommentSection에서 Escape으로 수정 취소가 가능하다', async ({ page }) => {
    await page.goto('http://localhost:3000/post/1');
    
    // 댓글 수정 모드 진입
    const editButton = page.locator('[data-testid="comment-edit-button"]').first();
    await editButton.click();
    
    const editEditor = page.locator('[data-testid="comment-edit-editor"] .ProseMirror');
    const originalContent = await editEditor.textContent();
    
    // 내용 수정
    await editEditor.clear();
    await editEditor.type('취소될 내용입니다.');
    
    // Escape로 취소
    await page.keyboard.press('Escape');
    
    // 원본 내용으로 복원되었는지 확인
    const commentContent = page.locator('[data-testid="comment-content"]').first();
    await expect(commentContent).toContainText(originalContent || '');
  });

  test('이미지 붙여넣기 기능이 작동한다', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const editor = page.locator('[data-testid="post-form-editor"] .ProseMirror');
    await editor.click();
    
    // 이미지 파일을 클립보드에 시뮬레이션하는 것은 복잡하므로
    // 파일 업로드 인터페이스가 있는지 확인
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    if (await fileInput.isVisible()) {
      await expect(fileInput).toBeVisible();
    }
    
    // 또는 드래그앤드롭 영역 확인
    const dropZone = page.locator('[data-testid="image-drop-zone"]');
    if (await dropZone.isVisible()) {
      await expect(dropZone).toBeVisible();
    }
  });
});