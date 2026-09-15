import { priorityOf } from '../reducers/todoReducer';

// 날짜 키는 항상 로컬 기준 'YYYY-MM-DD'. 문자열 비교로 순서가 맞는다.
export function dayKey(dateOrTs) {
    const d = new Date(dateOrTs);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

export function addDays(key, n) {
    const [y, m, d] = key.split('-').map(Number);
    return dayKey(new Date(y, m - 1, d + n));
}

// "9/20" 처럼 짧게. 올해가 아니면 "2027/1/5"
export function formatDay(key, todayKey) {
    const [y, m, d] = key.split('-').map(Number);
    return y === Number(todayKey.slice(0, 4)) ? `${m}/${d}` : `${y}/${m}/${d}`;
}

// 최근 days일 동안 날짜별 완료 개수. 오래된 순 → 오늘.
export function completedPerDay(todos, days, now = Date.now()) {
    const today = dayKey(now);
    const keys = Array.from({ length: days }, (_, i) => addDays(today, i - (days - 1)));
    const counts = Object.fromEntries(keys.map(k => [k, 0]));
    for (const todo of todos) {
        if (!todo.completed || !todo.completedAt) continue;
        const k = dayKey(todo.completedAt);
        if (k in counts) counts[k]++;
    }
    return keys.map(k => ({ day: k, count: counts[k] }));
}

export function countByPriority(todos) {
    const counts = { high: 0, normal: 0, low: 0 };
    for (const todo of todos) counts[priorityOf(todo)]++;
    return counts;
}

// 마감 기준 분류 — 대시보드 집계와 목록 필터가 같은 기준을 쓴다
export const DUE_BUCKETS = ['overdue', 'today', 'week', 'later', 'none'];
export const DUE_LABEL = { overdue: '지난 마감', today: '오늘 마감', week: '이번 주 마감', later: '그 이후 마감', none: '마감 없음' };

export function dueBucketOf(todo, todayKey) {
    if (!todo.dueDate) return 'none';
    if (todo.dueDate < todayKey) return 'overdue';
    if (todo.dueDate === todayKey) return 'today';
    if (todo.dueDate <= addDays(todayKey, 6)) return 'week';
    return 'later';
}

// 남은 할 일을 마감 기준으로 센다
export function dueBuckets(todos, now = Date.now()) {
    const today = dayKey(now);
    const buckets = { overdue: 0, today: 0, week: 0, later: 0, none: 0 };
    for (const todo of todos) {
        if (!todo.completed) buckets[dueBucketOf(todo, today)]++;
    }
    return buckets;
}

// 달력 칸 42개(6주), 일요일 시작. month는 0부터.
export function monthCells(year, month) {
    const firstDow = new Date(year, month, 1).getDay();
    return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(year, month, 1 - firstDow + i);
        return { key: dayKey(d), date: d.getDate(), inMonth: d.getMonth() === month, dow: d.getDay() };
    });
}

// 태그별 개수. 많은 것부터, 같으면 이름순. 태그 없는 항목은 tag: null 로 맨 뒤에.
export function countByTag(todos) {
    const counts = new Map();
    let untagged = 0;
    for (const todo of todos) {
        const tags = todo.tags ?? [];
        if (tags.length === 0) { untagged++; continue; }
        for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    const rows = [...counts].map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ko'));
    if (untagged > 0) rows.push({ tag: null, count: untagged });
    return rows;
}
