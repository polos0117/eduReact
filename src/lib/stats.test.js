import { test, expect } from 'vitest';
import { completedPerDay, dueBuckets, dueBucketOf, monthCells, addDays, dayKey } from './stats';

const NOW = new Date(2026, 8, 15, 12).getTime(); // 2026-09-15 정오

test('completedPerDay는 오늘까지 days일을 오래된 순으로 채우고 completedAt으로 센다', () => {
    const todos = [
        { completed: true, completedAt: NOW },
        { completed: true, completedAt: NOW - 24 * 3600 * 1000 },
        { completed: true, completedAt: NOW - 24 * 3600 * 1000 },
        { completed: true },          // 옛 데이터: 시각 없음 → 안 셈
        { completed: false, completedAt: NOW },
    ];
    const rows = completedPerDay(todos, 3, NOW);
    expect(rows.map(r => r.day)).toEqual(['2026-09-13', '2026-09-14', '2026-09-15']);
    expect(rows.map(r => r.count)).toEqual([0, 2, 1]);
});

test('dueBuckets는 남은 할 일만 마감 기준으로 나눈다', () => {
    const todos = [
        { dueDate: '2026-09-10' },
        { dueDate: '2026-09-15' },
        { dueDate: '2026-09-21' },
        { dueDate: '2026-09-22' },
        {},
        { dueDate: '2026-09-10', completed: true },
    ];
    expect(dueBuckets(todos, NOW)).toEqual({ overdue: 1, today: 1, week: 1, later: 1, none: 1 });
});

test('monthCells는 일요일부터 42칸이고 해당 달만 inMonth', () => {
    const cells = monthCells(2026, 8); // 2026년 9월 1일은 화요일
    expect(cells).toHaveLength(42);
    expect(cells[0]).toMatchObject({ key: '2026-08-30', inMonth: false, dow: 0 });
    expect(cells[2]).toMatchObject({ key: '2026-09-01', date: 1, inMonth: true });
    expect(cells.filter(c => c.inMonth)).toHaveLength(30);
});

test('addDays는 월 경계를 넘는다', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
});

test('dueBucketOf는 dueBuckets와 같은 기준으로 분류한다', () => {
    const today = '2026-09-15';
    expect(dueBucketOf({ dueDate: '2026-09-10' }, today)).toBe('overdue');
    expect(dueBucketOf({ dueDate: '2026-09-15' }, today)).toBe('today');
    expect(dueBucketOf({ dueDate: '2026-09-21' }, today)).toBe('week');
    expect(dueBucketOf({ dueDate: '2026-09-22' }, today)).toBe('later');
    expect(dueBucketOf({}, today)).toBe('none');
});
