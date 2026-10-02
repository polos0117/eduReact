import { describe, expect, it } from 'vitest';
import { mergeTodos, sameTodo } from './merge';

const T = (id, extra = {}) => ({ id, text: `할 일 ${id}`, completed: false, createdAt: id, ...extra });
const ids = (r) => r.todos.map(t => t.id);
const done = (id) => T(id, { completed: true, completedAt: 99 });

describe('sameTodo', () => {
    it('키 순서와 undefined 값은 무시한다', () => {
        expect(sameTodo({ id: 1, text: 'a', x: undefined }, { text: 'a', id: 1 })).toBe(true);
        expect(sameTodo(T(1), T(1, { text: '다름' }))).toBe(false);
        expect(sameTodo(T(1, { tags: ['a', 'b'] }), T(1, { tags: ['b', 'a'] }))).toBe(false); // 배열 순서는 의미가 있다
    });
});

describe('mergeTodos — 할 일마다', () => {
    it('한쪽에서만 고친 할 일은 고친 쪽을 따른다', () => {
        expect(mergeTodos([T(1)], [done(1)], [T(1)]).todos).toEqual([done(1)]);
        expect(mergeTodos([T(1)], [T(1)], [done(1)]).todos).toEqual([done(1)]);
    });
    it('양쪽에서 고쳤으면 이 기기 것', () => {
        const local = T(1, { text: '이 기기' });
        expect(mergeTodos([T(1)], [local], [T(1, { text: '다른 기기' })]).todos).toEqual([local]);
    });
    it('한쪽에서 지운 할 일은 지워진다 (어느 쪽이든)', () => {
        expect(ids(mergeTodos([T(1), T(2)], [T(1)], [T(1), T(2)]))).toEqual([1]);
        expect(ids(mergeTodos([T(1), T(2)], [T(1), T(2)], [T(1)]))).toEqual([1]);
        expect(ids(mergeTodos([T(1), T(2)], [T(1)], [T(1)]))).toEqual([1]);
    });
    it('지웠는데 다른 쪽에서 고쳤으면 살린다 — 잃지 않게', () => {
        expect(mergeTodos([T(1), T(2)], [T(1)], [T(1), done(2)]).todos).toEqual([T(1), done(2)]);
        expect(mergeTodos([T(1), T(2)], [T(1), done(2)], [T(1)]).todos).toEqual([T(1), done(2)]);
    });
    it('양쪽에서 새로 만든 할 일은 둘 다, 이웃 옆에 끼워 넣는다', () => {
        expect(ids(mergeTodos([T(1), T(2)], [T(1), T(3), T(2)], [T(1), T(2), T(4)]))).toEqual([1, 3, 2, 4]);
    });
    it('같은 id 를 양쪽에서 새로 만들었으면 이 기기 것', () => {
        const local = T(5, { text: '이 기기' });
        expect(mergeTodos([], [local], [T(5, { text: '다른 기기' })]).todos).toEqual([local]);
    });
    it('첫 연결(base 없음)은 합집합 — 아무것도 버리지 않는다', () => {
        expect(ids(mergeTodos([], [T(1), T(2)], [T(2), T(3)])).sort()).toEqual([1, 2, 3]);
    });
});

describe('mergeTodos — 순서', () => {
    it('이 기기에서 순서를 바꿨으면 이 기기 순서', () => {
        expect(ids(mergeTodos([T(1), T(2), T(3)], [T(3), T(1), T(2)], [T(1), T(2), T(3)]))).toEqual([3, 1, 2]);
    });
    it('다른 기기에서 바꿨으면 그 순서', () => {
        expect(ids(mergeTodos([T(1), T(2), T(3)], [T(1), T(2), T(3)], [T(2), T(3), T(1)]))).toEqual([2, 3, 1]);
    });
    it('앞 이웃이 없으면 뒤 이웃 앞에', () => {
        expect(ids(mergeTodos([T(1)], [T(9), T(1)], [T(1), T(2)]))).toEqual([9, 1, 2]);
    });
});

describe('mergeTodos — 바뀐 곳 표시', () => {
    it('아무것도 안 바뀌면 둘 다 false', () => {
        const r = mergeTodos([T(1)], [T(1)], [{ createdAt: 1, completed: false, text: '할 일 1', id: 1 }]);
        expect([r.changedLocal, r.changedRemote]).toEqual([false, false]);
    });
    it('다른 기기 변경만 → 이 기기만 바꿀 것', () => {
        const r = mergeTodos([T(1)], [T(1)], [done(1)]);
        expect([r.changedLocal, r.changedRemote]).toEqual([true, false]);
    });
    it('이 기기 변경만 → 올릴 것', () => {
        const r = mergeTodos([T(1)], [done(1)], [T(1)]);
        expect([r.changedLocal, r.changedRemote]).toEqual([false, true]);
    });
});
