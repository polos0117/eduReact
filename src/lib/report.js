import { NOTE_CATEGORIES, NOTE_LABEL, PRIORITY_LABEL, priorityOf } from '../reducers/todoReducer';
import { dayKey, formatDay, rangeOf } from './stats';

// 기간 보고서 — Markdown 한 덩어리. 어디에 붙여 넣어도 그냥 읽히게 꾸밈 없이 쓴다.
//   끝낸 일:   그 기간에 완료한 것 (completedAt 기준)
//   진행 중:   실제 기간이 그 기간과 겹치는데 아직 안 끝낸 것
//   마감 예정: 그 기간이 마감인데 위 둘에 없는 것
// options: { notes, subtasks } — 노트·하위 항목을 넣을지
export function buildReport(todos, { from, to }, todayKey, options = {}) {
    const { notes = true, subtasks = true } = options;
    const within = (key) => Boolean(key) && key >= from && key <= to;
    const day = (key) => formatDay(key, todayKey);

    const done = todos.filter(t => t.completed && t.completedAt && within(dayKey(t.completedAt)))
        .sort((a, b) => a.completedAt - b.completedAt);
    const doing = todos.filter(t => {
        if (t.completed) return false;
        const r = rangeOf(t, todayKey);
        return r && r.from <= to && r.to >= from;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
    const listed = new Set([...done, ...doing].map(t => t.id));
    const due = todos.filter(t => !t.completed && !listed.has(t.id) && within(t.dueDate))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const lines = [`# 작업 보고 ${from} ~ ${to}`, ''];
    const item = (todo, when) => {
        const meta = [when, PRIORITY_LABEL[priorityOf(todo)]];
        if (todo.tags?.length) meta.push(todo.tags.map(t => `#${t}`).join(' '));
        const out = [`- [${todo.completed ? 'x' : ' '}] ${todo.text} — ${meta.filter(Boolean).join(' · ')}`];
        if (todo.path) out.push(`  - 경로: ${todo.path}`);
        if (subtasks && todo.subtasks?.length) {
            out.push(`  - 하위: ${todo.subtasks.map(s => `${s.text}${s.done ? ' ✓' : ''}`).join(' / ')}`);
        }
        if (notes && todo.notes?.length) {
            for (const cat of NOTE_CATEGORIES) {
                for (const note of todo.notes.filter(n => n.category === cat)) {
                    const [first, ...rest] = note.text.split('\n');
                    out.push(`  - ${NOTE_LABEL[cat]}: ${first}`, ...rest.map(l => `    ${l}`));
                }
            }
        }
        return out;
    };
    const section = (title, list, when) => {
        lines.push(`## ${title} (${list.length})`, '');
        if (list.length === 0) lines.push('- 없음');
        else for (const todo of list) lines.push(...item(todo, when(todo)));
        lines.push('');
    };
    const period = (todo) => {
        const r = rangeOf(todo, todayKey);
        if (!r) return null;
        return r.ongoing && !todo.completed ? `${day(r.from)} ~` : `${day(r.from)} ~ ${day(r.to)}`;
    };
    section('끝낸 일', done, t => period(t) ?? `${day(dayKey(t.completedAt))} 완료`);
    section('진행 중', doing, period);
    section('마감 예정', due, t => `${day(t.dueDate)} 마감`);
    return lines.join('\n').trimEnd() + '\n';
}
