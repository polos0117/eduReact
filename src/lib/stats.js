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

// 남은 할 일을 마감 기준으로 나눈다
export function dueBuckets(todos, now = Date.now()) {
    const today = dayKey(now);
    const weekEnd = addDays(today, 6);
    const buckets = { overdue: 0, today: 0, week: 0, later: 0, none: 0 };
    for (const todo of todos) {
        if (todo.completed) continue;
        if (!todo.dueDate) buckets.none++;
        else if (todo.dueDate < today) buckets.overdue++;
        else if (todo.dueDate === today) buckets.today++;
        else if (todo.dueDate <= weekEnd) buckets.week++;
        else buckets.later++;
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
