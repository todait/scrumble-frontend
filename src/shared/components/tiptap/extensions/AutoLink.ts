import Link from '@tiptap/extension-link';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { findChildrenInRange } from '@tiptap/core';

// URL 패턴
const URL_REGEX = /(?:(?:https?:\/\/)|(?:www\.))(?:\S+)(?:[a-zA-Z0-9/])/g;

// 특수 링크 패턴
const GITHUB_PR_ISSUE_REGEX = /https?:\/\/github\.com\/[\w-]+\/[\w-]+\/(pull|issues)\/\d+/g;
const CLICKUP_TASK_REGEX = /https?:\/\/app\.clickup\.com\/t\/[\w]+/g;

export const AutoLink = Link.extend({
  name: 'autoLink',

  addOptions() {
    return {
      ...Link.options,
      openOnClick: true,
      linkOnPaste: true,
      autolink: true,
      HTMLAttributes: {
        class: 'text-[#9747FF] underline cursor-pointer hover:opacity-80',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    };
  },

  addProseMirrorPlugins() {
    const plugins = super.addProseMirrorPlugins?.() || [];

    if (!this.options.autolink) {
      return plugins;
    }

    plugins.push(
      new Plugin({
        key: new PluginKey('autoLink'),
        props: {
          handleTextInput(view, from, to, text) {
            const { state } = view;
            const $from = state.doc.resolve(from);
            
            if (!$from.parent.type.spec.code) {
              const textBefore = $from.parent.textBetween(
                Math.max(0, $from.parentOffset - 100),
                $from.parentOffset,
                undefined,
                '\ufffc'
              );
              
              const textWithNew = textBefore + text;
              const match = textWithNew.match(URL_REGEX);
              
              if (match) {
                const url = match[match.length - 1];
                const urlStart = from - (textBefore.length - textWithNew.lastIndexOf(url));
                const urlEnd = urlStart + url.length;
                
                // URL이 공백이나 줄바꿈으로 끝나는 경우에만 링크로 변환
                if (text === ' ' || text === '\n') {
                  const tr = state.tr
                    .insertText(text, from, to)
                    .addMark(
                      urlStart,
                      urlEnd,
                      state.schema.marks.link.create({ href: url })
                    );
                  
                  view.dispatch(tr);
                  return true;
                }
              }
            }
            
            return false;
          },
          
          handlePaste(view, event) {
            const text = event.clipboardData?.getData('text/plain');
            if (!text) return false;
            
            const { state, dispatch } = view;
            const { from, to } = state.selection;
            
            // URL 찾기
            const urls = text.match(URL_REGEX);
            if (!urls) return false;
            
            let tr = state.tr;
            let lastIndex = 0;
            
            urls.forEach(url => {
              const urlIndex = text.indexOf(url, lastIndex);
              const beforeText = text.slice(lastIndex, urlIndex);
              const afterText = text.slice(urlIndex + url.length);
              
              // URL 전 텍스트 삽입
              if (beforeText) {
                tr = tr.insertText(beforeText, from + lastIndex);
              }
              
              // URL을 링크로 삽입
              const linkMark = state.schema.marks.link.create({ href: url });
              tr = tr.insertText(url, from + lastIndex + beforeText.length)
                .addMark(
                  from + lastIndex + beforeText.length,
                  from + lastIndex + beforeText.length + url.length,
                  linkMark
                );
              
              lastIndex = urlIndex + url.length;
            });
            
            // 남은 텍스트 삽입
            if (lastIndex < text.length) {
              tr = tr.insertText(text.slice(lastIndex), from + lastIndex);
            }
            
            dispatch(tr);
            return true;
          },
        },
      })
    );

    return plugins;
  },
});

// 특수 링크 감지를 위한 헬퍼 함수
export function detectSpecialLinks(text: string): {
  type: 'github' | 'clickup' | 'normal';
  url: string;
}[] {
  const links: { type: 'github' | 'clickup' | 'normal'; url: string }[] = [];
  
  // GitHub PR/Issue 링크 감지
  const githubMatches = text.match(GITHUB_PR_ISSUE_REGEX);
  if (githubMatches) {
    githubMatches.forEach(url => {
      links.push({ type: 'github', url });
    });
  }
  
  // Clickup 작업 링크 감지
  const clickupMatches = text.match(CLICKUP_TASK_REGEX);
  if (clickupMatches) {
    clickupMatches.forEach(url => {
      links.push({ type: 'clickup', url });
    });
  }
  
  return links;
}