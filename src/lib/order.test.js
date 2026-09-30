import { describe, expect, it } from 'vitest';
import { moveTarget } from './order';

describe('moveTarget — 화면에 보이는 순서에서 한 칸 옮길 자리', () => {
    const ids = [10, 20, 30];
    it('위로: 바로 앞 항목의 앞', () => {
        expect(moveTarget(ids, 20, 'up')).toEqual({ targetId: 10, after: false });
    });
    it('아래로: 바로 뒤 항목의 뒤', () => {
        expect(moveTarget(ids, 20, 'down')).toEqual({ targetId: 30, after: true });
    });
    it('맨 위에서 위로, 맨 아래에서 아래로는 없음', () => {
        expect(moveTarget(ids, 10, 'up')).toBeNull();
        expect(moveTarget(ids, 30, 'down')).toBeNull();
    });
    it('목록에 없는 항목(걸러진 것)은 없음', () => {
        expect(moveTarget(ids, 99, 'up')).toBeNull();
    });
});
