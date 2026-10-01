import { describe, expect, it } from 'vitest';
import { addBall, createWorld, isResting, step } from './physics';
import { ballsFromTodos, baseRadius, contrast, dropX, dueText, fitLabel, isDoubleTap, MAX_BALLS, readableOn } from './pile';

const today = '2026-10-01';
const T = (id, extra = {}) => ({ id, text: `할 일 ${id}`, completed: false, createdAt: id, ...extra });

describe('ballsFromTodos', () => {
    it('끝낸 일·보관한 일은 빼고, 우선순위 → 마감 → 원래 순서', () => {
        const { items, hidden } = ballsFromTodos([
            T(1, { priority: 'low' }), T(2), T(3, { priority: 'high', dueDate: '2026-10-09' }),
            T(4, { completed: true }), T(5, { completed: true, archived: true }),
            T(6, { priority: 'high', dueDate: '2026-10-02' }), T(7),
        ], today);
        expect(items.map(i => i.id)).toEqual([6, 3, 2, 7, 1]);
        expect(hidden).toBe(0);
    });
    it('우선순위별 크기 비율, 지난 마감 표시', () => {
        const { items } = ballsFromTodos([T(1, { priority: 'high', dueDate: '2026-09-30' }), T(2), T(3, { priority: 'low' })], today);
        expect(items.map(i => [i.priority, i.scale, i.overdue])).toEqual([['high', 1, true], ['normal', 0.78, false], ['low', 0.6, false]]);
    });
    it(`${MAX_BALLS}개를 넘으면 나머지는 hidden 으로 센다`, () => {
        const many = Array.from({ length: MAX_BALLS + 7 }, (_, i) => T(i + 1));
        const { items, hidden } = ballsFromTodos(many, today);
        expect(items).toHaveLength(MAX_BALLS);
        expect(hidden).toBe(7);
    });
});

describe('baseRadius', () => {
    it('너비 / 11, 18~44 사이', () => {
        expect(baseRadius(320)).toBeCloseTo(29.09, 1);
        expect(baseRadius(100)).toBe(18);
        expect(baseRadius(1200)).toBe(44);
    });
});

describe('dropX', () => {
    it('같은 id 면 같은 값, 0 이상 1 미만, id 마다 퍼진다', () => {
        expect(dropX(1727000000000)).toBe(dropX(1727000000000));
        const xs = Array.from({ length: 50 }, (_, i) => dropX(1727000000000 + i));
        expect(xs.every(x => x >= 0 && x < 1)).toBe(true);
        expect(new Set(xs.map(x => Math.floor(x * 5))).size).toBe(5);
    });
});

describe('fitLabel', () => {
    const measure = (s) => [...s].length * 10; // 글자당 10px
    it('들어가면 그대로, 넘치면 … 로 자른다', () => {
        expect(fitLabel('보고서', 30, measure)).toBe('보고서');
        expect(fitLabel('주간 보고서 쓰기', 50, measure)).toBe('주간 보…');
    });
    it('이모지를 반으로 쪼개지 않는다', () => {
        expect(fitLabel('🎉🎉🎉🎉', 30, measure)).toBe('🎉🎉…');
    });
    it('… 도 안 들어가면 빈 글', () => {
        expect(fitLabel('보고서', 5, measure)).toBe('');
    });
});

describe('isDoubleTap', () => {
    const tap = (id, t, x = 0, y = 0) => ({ id, t, x, y });
    it('같은 공을 350ms 안에 두 번', () => {
        expect(isDoubleTap(tap(1, 0), tap(1, 300))).toBe(true);
        expect(isDoubleTap(tap(1, 0), tap(1, 400))).toBe(false);
        expect(isDoubleTap(null, tap(1, 10))).toBe(false);
    });
    it('다른 공이거나 멀리 떨어진 곳이면 아니다', () => {
        expect(isDoubleTap(tap(1, 0), tap(2, 100))).toBe(false);
        expect(isDoubleTap(tap(1, 0, 0, 0), tap(1, 100, 40, 0))).toBe(false);
    });
});

describe('readableOn', () => {
    it('대비가 더 높은 글자색을 고른다', () => {
        const ink = { css: 'ink', rgb: [21, 23, 28] };
        const sheet = { css: 'sheet', rgb: [255, 255, 255] };
        expect(readableOn([31, 63, 158], [ink, sheet]).css).toBe('sheet');  // 진한 파랑 위엔 흰 글자
        expect(readableOn([169, 189, 236], [ink, sheet]).css).toBe('ink');  // 연한 파랑 위엔 검은 글자
        expect(contrast([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 0);
    });
});

describe('dueText', () => {
    it('오늘·내일·M/D', () => {
        expect(dueText(today, today)).toBe('오늘');
        expect(dueText('2026-10-02', today)).toBe('내일');
        expect(dueText('2026-09-28', today)).toBe('9/28');
    });
});

describe('ballsFromTodos — 무대 크기에 맞춰 덜어 낸다', () => {
    const highs = Array.from({ length: 150 }, (_, i) => T(i + 1, { priority: 'high' }));
    it('공 면적 합이 무대의 절반을 넘지 않게, 덜어 낸 수는 hidden 에', () => {
        const stage = { width: 350, height: 500 };
        const { items, hidden } = ballsFromTodos(highs, today, stage);
        const r = baseRadius(350);
        expect(items.length * Math.PI * r * r).toBeLessThanOrEqual(0.5 * 350 * 500);
        expect(items.length + hidden).toBe(150);
        expect(items.length).toBeGreaterThan(0);
    });
    it('덜어 낸 더미는 실제로 떨어뜨려도 무대 위로 넘치지 않고 멈춘다', () => {
        const stage = { width: 350, height: 500 };
        const { items } = ballsFromTodos(highs, today, stage);
        const world = createWorld(stage);
        const r = baseRadius(stage.width);
        items.forEach((item, i) => addBall(world, { id: item.id, x: r + dropX(item.id) * (stage.width - 2 * r), y: -r - i * 2 * r, r: r * item.scale }));
        let steps = 0;
        while (!isResting(world) && steps < 3000) { step(world); steps++; }
        expect(steps).toBeLessThan(3000);
        expect(Math.min(...world.balls.map(b => b.y - b.r))).toBeGreaterThanOrEqual(0);
    });
    it('무대를 모르면(아직 안 쟀으면) 150개 제한만', () => {
        expect(ballsFromTodos(highs, today).items).toHaveLength(150);
    });
});
