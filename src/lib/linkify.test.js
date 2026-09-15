import { test, expect } from 'vitest';
import { linkify, revUrl } from './linkify';

test('linkify는 URL과 r번호를 조각으로 나누고 나머지는 그대로 둔다', () => {
    expect(linkify('커밋 r5074 · 문서 https://a.b/c?d=1) 끝')).toEqual([
        { type: 'text', value: '커밋 ' },
        { type: 'rev', value: '5074', raw: 'r5074' },
        { type: 'text', value: ' · 문서 ' },
        { type: 'url', value: 'https://a.b/c?d=1' },
        { type: 'text', value: ') 끝' },
    ]);
});

test('linkify는 r 뒤 숫자가 짧거나 단어 안에 있으면 링크로 보지 않는다', () => {
    expect(linkify('r12 error5074 var5')).toEqual([{ type: 'text', value: 'r12 error5074 var5' }]);
    expect(linkify('')).toEqual([]);
});

test('revUrl은 {n}을 바꾸고, 없으면 뒤에 붙인다', () => {
    expect(revUrl('https://svn/x/rev/{n}', '7')).toBe('https://svn/x/rev/7');
    expect(revUrl('https://svn/x/rev/', '7')).toBe('https://svn/x/rev/7');
});
