import { test, expect } from 'vitest';
import { tagColorIndex, tagClass, tagHref, TAG_COLOR_COUNT } from './tags';

test('tagColorIndex는 같은 이름에 늘 같은 색을, 범위 안에서 준다', () => {
    expect(tagColorIndex('kipa')).toBe(tagColorIndex('kipa'));
    for (const tag of ['kipa', '개인', 'backend', '긴-태그-이름', 'a', '']) {
        const i = tagColorIndex(tag);
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(TAG_COLOR_COUNT);
    }
    expect(tagClass('kipa')).toMatch(/^tag-c[0-3]$/);
});

test('tagColorIndex는 흔한 태그들을 한 색으로 몰지 않는다', () => {
    const used = new Set(['kipa', '개인', '업무', '공부', '긴급', 'bug'].map(tagColorIndex));
    expect(used.size).toBeGreaterThanOrEqual(3);
});

test('tagHref는 한글·특수문자를 인코딩한다', () => {
    expect(tagHref('개인')).toBe('#todos?tag=%EA%B0%9C%EC%9D%B8');
    expect(tagHref('a b')).toBe('#todos?tag=a%20b');
});
