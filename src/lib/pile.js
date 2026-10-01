import { PRIORITIES, priorityOf } from '../reducers/todoReducer';
import { addDays, dueBucketOf, formatDay } from './stats';

// 더미 탭: 할 일 → 공 정보, 그리고 화면이 쓰는 작은 판정들. DOM 을 모른다.

export const MAX_BALLS = 150;
export const SCALE = { high: 1, normal: 0.78, low: 0.6 };

// 화면이 좁으면 공도 작게
export const baseRadius = (width) => Math.min(44, Math.max(18, width / 11));

// 공 면적 합이 무대의 이만큼을 넘지 않게 — 넘치면 위로 쌓여 안 보이고 누를 수도 없고, 더미가 멈추지 않는다
const STAGE_FILL = 0.5;

// 무거운(우선순위 높은) 공부터 떨어져 바닥에 깔린다.
// stage({ width, height })를 주면 무대에 들어갈 만큼만, 나머지는 hidden 에 센다
export function ballsFromTodos(todos, todayKey, stage) {
    const open = todos
        .map((todo, index) => ({ todo, index }))
        .filter(({ todo }) => !todo.completed && !todo.archived)
        .sort((a, b) => PRIORITIES.indexOf(priorityOf(a.todo)) - PRIORITIES.indexOf(priorityOf(b.todo))
            || (a.todo.dueDate ?? '9999').localeCompare(b.todo.dueDate ?? '9999')
            || a.index - b.index);
    let limit = MAX_BALLS;
    if (stage) {
        const base = baseRadius(stage.width);
        let area = 0;
        limit = open.slice(0, MAX_BALLS).findIndex(({ todo }) => {
            area += Math.PI * (base * SCALE[priorityOf(todo)]) ** 2;
            return area > STAGE_FILL * stage.width * stage.height;
        });
        if (limit === -1) limit = Math.min(open.length, MAX_BALLS);
    }
    const items = open.slice(0, limit).map(({ todo }) => ({
        id: todo.id,
        text: todo.text,
        priority: priorityOf(todo),
        dueDate: todo.dueDate,
        overdue: dueBucketOf(todo, todayKey) === 'overdue',
        scale: SCALE[priorityOf(todo)],
    }));
    return { items, hidden: open.length - items.length };
}

// 떨어질 가로 자리를 id 로 정한다(FNV-1a) — 같은 목록이면 같은 모양으로 쌓인다
export function dropX(id) {
    let h = 2166136261;
    for (const ch of String(id)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    // 마지막 글자만 다른 id(연달아 만든 할 일)는 FNV 만으론 비슷한 값이 나온다 — 한 번 더 섞는다
    h ^= h >>> 15;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    return (h >>> 0) / 2 ** 32;
}

// 공 너비에 맞게 자른다. 글자 단위(Array.from)라 이모지가 반으로 쪼개지지 않는다
export function fitLabel(text, maxWidth, measure) {
    if (measure(text) <= maxWidth) return text;
    const chars = Array.from(text);
    for (let n = chars.length - 1; n > 0; n--) {
        const cut = `${chars.slice(0, n).join('')}…`;
        if (measure(cut) <= maxWidth) return cut;
    }
    return '';
}

export const DOUBLE_TAP_MS = 350;
const DOUBLE_TAP_PX = 24;
export const isDoubleTap = (prev, next) => !!prev && prev.id === next.id
    && next.t - prev.t <= DOUBLE_TAP_MS
    && Math.hypot(next.x - prev.x, next.y - prev.y) <= DOUBLE_TAP_PX;

// WCAG 대비비
const luminance = (rgb) => {
    const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}
export const readableOn = (bg, candidates) =>
    candidates.reduce((best, c) => (contrast(bg, c.rgb) > contrast(bg, best.rgb) ? c : best));

export function dueText(dueDate, todayKey) {
    if (dueDate === todayKey) return '오늘';
    if (dueDate === addDays(todayKey, 1)) return '내일';
    return formatDay(dueDate, todayKey);
}
