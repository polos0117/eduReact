import { test, expect } from 'vitest';
import { tagColorIndex, tagStyle, customColor, pickerValue, tagHref, TAG_COLOR_COUNT } from './tags';

test('tagColorIndex는 같은 이름에 늘 같은 색을, 범위 안에서 준다', () => {
    expect(tagColorIndex('kipa')).toBe(tagColorIndex('kipa'));
    for (const tag of ['kipa', '개인', 'backend', '긴-태그-이름', 'a', '']) {
        const i = tagColorIndex(tag);
        expect(i).toBeGreaterThanOrEqual(0);
        expect(i).toBeLessThan(TAG_COLOR_COUNT);
    }
    expect(tagStyle('kipa').className).toMatch(/^tag-c[0-3]$/);
});

// 이 테스트가 없어서 한글 태그가 한 색으로 몰리는 걸 놓쳤다.
// %4 는 하위 2비트만 보는데 한글 음절은 그 비트가 치우쳐 있어, 해시에 마무리 단계가
// 없으면 '잔여'·'개선'·'완료'가 전부 같은 색이 된다.
test('tagColorIndex는 한글 태그를 고르게 나눈다', () => {
    const ko = ['잔여', '개선', '완료', '보류', '긴급', '확인', '검토', '배포', '회의', '문서',
        '버그', '기획', '설계', '테스트', '운영', '개인', '업무', '공부', '정리', '수정'];
    const counts = Array(TAG_COLOR_COUNT).fill(0);
    for (const tag of ko) counts[tagColorIndex(tag)]++;
    expect(counts.every(n => n > 0)).toBe(true);
    expect(Math.max(...counts)).toBeLessThanOrEqual(ko.length / 2); // 절반 넘게 한 색이면 실패
    expect(tagColorIndex('잔여')).not.toBe(tagColorIndex('개선'));
});

test('tagColorIndex는 영문·숫자 섞인 태그도 나눈다', () => {
    const used = new Set(['kipa', 'bug', 'fe', 'be', 'v2', '2026'].map(tagColorIndex));
    expect(used.size).toBeGreaterThanOrEqual(3);
});

test('tagHref는 한글·특수문자를 인코딩한다', () => {
    expect(tagHref('개인')).toBe('#todos?tag=%EA%B0%9C%EC%9D%B8');
    expect(tagHref('a b')).toBe('#todos?tag=a%20b');
});

test('직접 고른 색(hex)이 자동 배정을 이긴다', () => {
    expect(customColor('잔여', { 잔여: '#ff8800' })).toBe('#ff8800');
    expect(tagStyle('잔여', { 잔여: '#ff8800' })).toEqual({ className: 'tag-custom', style: { '--tag': '#ff8800' } });
    expect(pickerValue('잔여', { 잔여: '#ff8800' })).toBe('#ff8800');
});

test('hex 가 아닌 값은 무시하고 자동으로 돌아간다', () => {
    for (const bad of ['red', '#fff', '#12345', 'ff8800', 42, null, undefined]) {
        expect(customColor('잔여', { 잔여: bad })).toBeNull();
        expect(tagStyle('잔여', { 잔여: bad }).className).toBe(tagStyle('잔여').className);
    }
    expect(customColor('잔여', { 개선: '#ff8800' })).toBeNull();
});

test('예전 판이 저장한 0..3 숫자도 그대로 읽는다', () => {
    expect(tagColorIndex('잔여', { 잔여: 2 })).toBe(2);
    expect(tagStyle('잔여', { 잔여: 2 }).className).toBe('tag-c2');
    expect(tagColorIndex('잔여', { 잔여: 9 })).toBe(tagColorIndex('잔여'));
});

test('pickerValue 는 자동일 때 팔레트 색을 시작값으로 준다', () => {
    expect(pickerValue('잔여')).toMatch(/^#[0-9a-f]{6}$/);
});
