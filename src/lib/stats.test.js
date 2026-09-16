import { test, expect } from 'vitest';
import { completedPerDay, dueBuckets, dueBucketOf, monthCells, addDays, dayKey, countByTag, parseDue, rangeOf, weekLanes, weekOf, monthOf, daysBetween, periodStats } from './stats';

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

test('countByTag는 태그가 여러 개인 항목을 각 태그에 세고, 없는 항목은 맨 뒤에 모은다', () => {
    const todos = [
        { tags: ['kipa', '긴급'] },
        { tags: ['kipa'] },
        { tags: ['개인'] },
        {},
        { tags: [] },
    ];
    expect(countByTag(todos)).toEqual([
        { tag: 'kipa', count: 2 },
        { tag: '개인', count: 1 },
        { tag: '긴급', count: 1 },
        { tag: null, count: 2 },
    ]);
    expect(countByTag([])).toEqual([]);
});

test('parseDue는 제목 끝의 @표기를 마감일로 떼어낸다', () => {
    const today = '2026-09-15'; // 화요일
    expect(parseDue('보고서 @내일', today)).toEqual({ text: '보고서', dueDate: '2026-09-16' });
    expect(parseDue('보고서 @오늘', today).dueDate).toBe('2026-09-15');
    expect(parseDue('보고서 @모레', today).dueDate).toBe('2026-09-17');
    expect(parseDue('보고서 @다음주', today).dueDate).toBe('2026-09-22');
    expect(parseDue('보고서 @금', today).dueDate).toBe('2026-09-18');     // 이번 주 금요일
    expect(parseDue('보고서 @화요일', today).dueDate).toBe('2026-09-22'); // 오늘이 화요일이면 다음 주
    expect(parseDue('보고서 @9/25', today).dueDate).toBe('2026-09-25');
    expect(parseDue('보고서 @1/5', today).dueDate).toBe('2027-01-05');    // 지난 날짜면 내년
    expect(parseDue('보고서 @2026-10-02', today).dueDate).toBe('2026-10-02');
    expect(parseDue('@내일 보고서 제출', today)).toEqual({ text: '보고서 제출', dueDate: '2026-09-16' });
});

test('parseDue는 못 알아듣는 @표기와 이메일은 그대로 둔다', () => {
    const today = '2026-09-15';
    expect(parseDue('메일 보내기 @철수', today)).toEqual({ text: '메일 보내기 @철수', dueDate: undefined });
    expect(parseDue('a@b.com 확인', today).text).toBe('a@b.com 확인'); // 앞에 공백이 없으면 표기가 아니다
    expect(parseDue('@내일', today)).toEqual({ text: '@내일', dueDate: '2026-09-16' }); // 제목이 비면 원문 유지
});

test('rangeOf는 시작일이 있어야 기간으로 보고, 종료일이 없으면 진행 중으로 오늘까지 잡는다', () => {
    const today = '2026-09-15';
    expect(rangeOf({ text: 'a' }, today)).toBe(null);
    expect(rangeOf({ startDate: '2026-09-10', endDate: '2026-09-12' }, today))
        .toEqual({ from: '2026-09-10', to: '2026-09-12', ongoing: false });
    expect(rangeOf({ startDate: '2026-09-10' }, today))
        .toEqual({ from: '2026-09-10', to: today, ongoing: true }); // 아직 안 끝남 → 오늘까지
    expect(rangeOf({ startDate: '2026-09-20' }, today))
        .toEqual({ from: '2026-09-20', to: '2026-09-20', ongoing: true }); // 미래 시작은 하루짜리
    // 완료했는데 종료일을 안 적었으면 완료한 날까지
    expect(rangeOf({ startDate: '2026-09-10', completed: true, completedAt: new Date(2026, 8, 12, 9).getTime() }, today).to)
        .toBe('2026-09-12');
    // 거꾸로 넣은 종료일은 시작일로 당긴다
    expect(rangeOf({ startDate: '2026-09-10', endDate: '2026-09-01' }, today).to).toBe('2026-09-10');
});

test('weekLanes는 겹치는 막대만 아래 층으로 내리고 주 경계에서 자른다', () => {
    const week = ['2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19'];
    const lanes = weekLanes([
        { todo: { id: 1 }, from: '2026-09-14', to: '2026-09-16' },
        { todo: { id: 2 }, from: '2026-09-15', to: '2026-09-17' }, // 1과 겹침 → 둘째 층
        { todo: { id: 3 }, from: '2026-09-18', to: '2026-09-18' }, // 1 뒤라 첫째 층에 같이
        { todo: { id: 4 }, from: '2026-09-10', to: '2026-09-25' }, // 주를 통째로 넘어감
        { todo: { id: 5 }, from: '2026-10-01', to: '2026-10-02' }, // 이 주가 아님
    ], week);
    expect(lanes.map(lane => lane.map(s => s.todo.id))).toEqual([[4], [1, 3], [2]]);
    expect(lanes[0][0]).toMatchObject({ startCol: 0, endCol: 6, openLeft: true, openRight: true });
    expect(lanes[1][0]).toMatchObject({ startCol: 1, endCol: 3, openLeft: false, openRight: false });
    expect(lanes[1][1]).toMatchObject({ startCol: 5, endCol: 5 });
});

test('weekOf는 월~일, monthOf는 1일~말일', () => {
    expect(weekOf('2026-09-16')).toEqual({ from: '2026-09-14', to: '2026-09-20' }); // 수요일
    expect(weekOf('2026-09-20')).toEqual({ from: '2026-09-14', to: '2026-09-20' }); // 일요일은 그 주의 끝
    expect(weekOf('2026-09-14')).toEqual({ from: '2026-09-14', to: '2026-09-20' }); // 월요일은 시작
    expect(weekOf('2026-09-16', -1)).toEqual({ from: '2026-09-07', to: '2026-09-13' });
    expect(monthOf('2026-09-16')).toEqual({ from: '2026-09-01', to: '2026-09-30' });
    expect(monthOf('2026-01-15', -1)).toEqual({ from: '2025-12-01', to: '2025-12-31' }); // 해를 넘어 지난달
    expect(daysBetween('2026-09-10', '2026-09-12')).toBe(2);
});

test('periodStats는 진행 중·이번 주 시작·끝·평균 소요일을 센다', () => {
    const today = '2026-09-16'; // 수요일, 이번 주 = 9/14~9/20
    const todos = [
        { startDate: '2026-09-07', endDate: '2026-09-18', completed: false },         // 진행 중, 이번 주 끝날 예정
        { startDate: '2026-09-15', completed: false },                                // 진행 중, 이번 주 시작
        { startDate: '2026-09-21', completed: false },                                // 아직 시작 전 → 진행 중 아님
        { startDate: '2026-09-09', completed: true, completedAt: new Date(2026, 8, 11).getTime() }, // 3일, 지난주 끝
        { startDate: '2026-09-14', endDate: '2026-09-16', completed: true, completedAt: new Date(2026, 8, 16).getTime() }, // 3일, 이번 주 시작·끝
        { text: '기간 없음', completed: true, completedAt: 1 },
    ];
    expect(periodStats(todos, today)).toEqual({ ongoing: 2, started: 2, ended: 2, avgDays: 3, samples: 2 });
    expect(periodStats([], today)).toEqual({ ongoing: 0, started: 0, ended: 0, avgDays: null, samples: 0 });
});
