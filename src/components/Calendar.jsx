import { useState } from 'react';
import { PRIORITIES, PRIORITY_LABEL, priorityOf, sortByPriority } from '../reducers/todoReducer';
import { dayKey, monthCells } from '../lib/stats';
import { holidaysForRange } from '../lib/holidays';
import { useNow } from '../hooks/useNow';
import { tagHref } from '../lib/tags';
import { useTagStyle } from '../hooks/useTagColors';
import ColorByToggle from './ColorByToggle';
import TodoForm from './Todo/TodoForm';
import DoneButton from './Todo/DoneButton';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const MAX_CHIPS = 2;

function Calendar({ todos, dispatch, onOpenTodo, colorBy, onColorByChange }) {
    const tagStyle = useTagStyle();
    const todayKey = dayKey(useNow());
    const [selected, setSelected] = useState(todayKey);
    const [view, setView] = useState(() => {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    function moveMonth(delta) {
        setView(v => {
            const d = new Date(v.year, v.month + delta, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });
    }
    function goToday() {
        const d = new Date();
        setView({ year: d.getFullYear(), month: d.getMonth() });
        setSelected(todayKey);
    }

    // 날짜별 할 일 묶기 (마감일 있는 것만)
    const byDay = {};
    for (const todo of todos) {
        if (!todo.dueDate) continue;
        (byDay[todo.dueDate] ??= []).push(todo);
    }
    const cells = monthCells(view.year, view.month);
    const holidays = holidaysForRange(cells[0].key, cells.at(-1).key); // 달력 칸이 해를 넘길 수 있다
    const dayTodos = sortByPriority(byDay[selected] ?? []);
    const [sy, sm, sd] = selected.split('-').map(Number);
    const noDueCount = todos.filter(todo => !todo.completed && !todo.dueDate).length;

    // 칸 안 칩은 왼쪽 선 색만 바꾼다 — 우선순위 또는 첫 태그 (태그가 없으면 회색)
    const chipColor = (todo) => colorBy === 'tag'
        ? (todo.tags?.[0] ? tagStyle(todo.tags[0]) : { className: 'no-tag' })
        : { className: `priority-${priorityOf(todo)}` };

    function addTodo(text, priority, dueDate, tags) {
        const now = Date.now();
        dispatch({ type: 'ADD', todo: { id: now, text, completed: false, priority, createdAt: now, dueDate, tags: tags?.length ? tags : undefined } });
    }

    return (
        <div className="calendar">
            <div className="cal-head">
                <h2 className="cal-title">{view.year}년 {view.month + 1}월</h2>
                <div className="cal-nav">
                    {noDueCount > 0 && (
                        <a href="#todos?filter=active&due=none" className="ghost-btn" title="마감일이 없는 남은 할 일을 목록에서 보기">
                            마감 없음 {noDueCount}
                        </a>
                    )}
                    <ColorByToggle value={colorBy} onChange={onColorByChange} />
                    <button type="button" className="ghost-btn" onClick={goToday}>오늘</button>
                    <button type="button" className="icon-btn" onClick={() => moveMonth(-1)} aria-label="이전 달">‹</button>
                    <button type="button" className="icon-btn" onClick={() => moveMonth(1)} aria-label="다음 달">›</button>
                </div>
            </div>

            <div className="cal-grid" role="group" aria-label={`${view.year}년 ${view.month + 1}월`}>
                {DOW.map((d, i) => <div key={d} className={`cal-dow dow-${i}`} aria-hidden="true">{d}</div>)}
                {cells.map(cell => {
                    const items = byDay[cell.key] ?? [];
                    const holiday = holidays.get(cell.key);
                    const cls = ['cal-cell', `dow-${cell.dow}`];
                    if (!cell.inMonth) cls.push('out');
                    if (holiday) cls.push('holiday');
                    if (cell.key === todayKey) cls.push('today');
                    if (cell.key === selected) cls.push('selected');
                    return (
                        <button type="button" key={cell.key} className={cls.join(' ')}
                            aria-pressed={cell.key === selected} onClick={() => setSelected(cell.key)}
                            aria-label={`${cell.key} ${DOW[cell.dow]}요일${holiday ? `, ${holiday}` : ''}, 할 일 ${items.length}개`}>
                            <span className="cal-date">{cell.date}</span>
                            {holiday && <span className="cal-holiday" title={holiday}>{holiday}</span>}
                            {items.length > 0 && (
                                <span className="cal-items">
                                    {items.slice(0, MAX_CHIPS).map(todo => (
                                        <span key={todo.id} style={chipColor(todo).style}
                                            className={`cal-chip ${chipColor(todo).className}${todo.completed ? ' completed' : ''}`}>
                                            {todo.text}
                                        </span>
                                    ))}
                                    {items.length > MAX_CHIPS && <span className="cal-more">+{items.length - MAX_CHIPS}</span>}
                                    <span className="cal-dot" aria-hidden="true">{items.length}</span>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <section className="cal-day" aria-labelledby="cal-day-title">
                <div className="cal-day-head">
                    <h3 id="cal-day-title" className="section-title">
                        {sm}월 {sd}일 {DOW[new Date(sy, sm - 1, sd).getDay()]}요일{selected === todayKey ? ' (오늘)' : ''}
                        {holidays.get(selected) && <> <span className="cal-day-holiday">{holidays.get(selected)}</span></>}
                    </h3>
                    {dayTodos.length > 0 && (
                        <a href={`#todos?due=${selected}`} className="link-btn">목록에서 보기</a>
                    )}
                </div>
                {dayTodos.length === 0
                    ? <p className="section-note">이 날짜가 마감인 항목이 없어요.</p>
                    : (
                        <ul className="cal-day-list">
                            {dayTodos.map(todo => (
                                <li key={todo.id} className={`todo-item priority-${priorityOf(todo)}${todo.completed ? ' completed' : ''}`}>
                                    <div className="todo-item-main">
                                        <DoneButton completed={todo.completed} label={todo.text}
                                            onToggle={() => dispatch({ type: 'TOGGLE', id: todo.id, at: Date.now() })} />
                                        <button type="button" className="todo-item-text" onClick={() => onOpenTodo(todo.id)} title="상세 보기">
                                            {todo.text}
                                            {todo.notes?.length > 0 && <span className="note-count">≡ {todo.notes.length}</span>}
                                        </button>
                                    </div>
                                    <div className="todo-item-meta">
                                    {todo.tags?.map(tag => (
                                        <a key={tag} {...tagStyle(tag)} className={`tag-chip ${tagStyle(tag).className}`}
                                            href={tagHref(tag)} title={`#${tag} 항목만 보기`}>#{tag}</a>
                                    ))}
                                    <select className={`priority-select priority-${priorityOf(todo)}`} value={priorityOf(todo)}
                                        onChange={(e) => dispatch({ type: 'SET_PRIORITY', id: todo.id, priority: e.target.value })}
                                        aria-label={`${todo.text} 우선순위`} title="우선순위">
                                        {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
                                    </select>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                <TodoForm onAddTodo={addTodo} fixedDue={selected} placeholder="이 날짜에 할 일 추가" />
            </section>
        </div>
    );
}

export default Calendar;
