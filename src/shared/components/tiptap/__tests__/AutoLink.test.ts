import { detectSpecialLinks } from '../extensions/AutoLink';

describe('AutoLink Extension', () => {
  describe('detectSpecialLinks', () => {
    it('GitHub PR 링크를 올바르게 감지한다', () => {
      const text = 'Check this PR: https://github.com/owner/repo/pull/123';
      const links = detectSpecialLinks(text);
      
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        type: 'github',
        url: 'https://github.com/owner/repo/pull/123'
      });
    });

    it('GitHub Issue 링크를 올바르게 감지한다', () => {
      const text = 'See issue: https://github.com/owner/repo/issues/456';
      const links = detectSpecialLinks(text);
      
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        type: 'github',
        url: 'https://github.com/owner/repo/issues/456'
      });
    });

    it('Clickup 작업 링크를 올바르게 감지한다', () => {
      const text = 'Task link: https://app.clickup.com/t/abc123def';
      const links = detectSpecialLinks(text);
      
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        type: 'clickup',
        url: 'https://app.clickup.com/t/abc123def'
      });
    });

    it('여러 타입의 링크를 동시에 감지한다', () => {
      const text = `
        GitHub PR: https://github.com/owner/repo/pull/123
        GitHub Issue: https://github.com/owner/repo/issues/456
        Clickup Task: https://app.clickup.com/t/xyz789
      `;
      const links = detectSpecialLinks(text);
      
      expect(links).toHaveLength(3);
      expect(links.map(l => l.type)).toEqual(['github', 'github', 'clickup']);
    });

    it('일반 URL은 감지하지 않는다', () => {
      const text = 'Visit https://example.com for more info';
      const links = detectSpecialLinks(text);
      
      expect(links).toHaveLength(0);
    });

    it('HTTP와 HTTPS 프로토콜을 모두 지원한다', () => {
      const text = `
        HTTP PR: http://github.com/owner/repo/pull/123
        HTTPS PR: https://github.com/owner/repo/pull/456
      `;
      const links = detectSpecialLinks(text);
      
      expect(links).toHaveLength(2);
      expect(links[0].url).toBe('http://github.com/owner/repo/pull/123');
      expect(links[1].url).toBe('https://github.com/owner/repo/pull/456');
    });

    it('잘못된 형식의 GitHub 링크는 감지하지 않는다', () => {
      const invalidLinks = [
        'https://github.com/owner/repo',
        'https://github.com/owner',
        'https://github.com/owner/repo/pull',
        'https://github.com/owner/repo/issues',
      ];
      
      invalidLinks.forEach(link => {
        const links = detectSpecialLinks(link);
        expect(links).toHaveLength(0);
      });
    });

    it('잘못된 형식의 Clickup 링크는 감지하지 않는다', () => {
      const invalidLinks = [
        'https://app.clickup.com',
        'https://app.clickup.com/t',
        'https://clickup.com/t/abc123',
      ];
      
      invalidLinks.forEach(link => {
        const links = detectSpecialLinks(link);
        expect(links).toHaveLength(0);
      });
    });

    it('빈 텍스트에서는 아무것도 감지하지 않는다', () => {
      const links = detectSpecialLinks('');
      expect(links).toHaveLength(0);
    });

    it('링크가 없는 텍스트에서는 아무것도 감지하지 않는다', () => {
      const text = 'This is just a regular text without any links';
      const links = detectSpecialLinks(text);
      expect(links).toHaveLength(0);
    });
  });
});