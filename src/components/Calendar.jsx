import { Fragment, useState } from 'react';
import { PRIORITIES, PRIORITY_LABEL, priorityOf, sortByPriority } from '../reducers/todoReducer';
import { addDays, dayKey, monthCells, rangeOf, weekLanes } from '../lib/stats';
import { holidaysForRange } from '../lib/holidays';
import { useNow } from '../hooks/useNow';
import { useLocalState } from '../hooks/useLocalState';
import { tagHref } from '../lib/tags';
import { useTagStyle } from '../hooks/useTagColors';
import ColorByToggle from './ColorByToggle';
import TodoForm from './Todo/TodoForm';
import DoneButton from './Todo/DoneButton';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

// 두 가지 보기: 마감일 하루에 찍는 칩, 실제 시작~종료를 가로지르는 막대
const VIEWS = [['due', '마감'], ['range', '기간']];
// 두 가지 눈금: 한 달 격자, 한 주(칸이 커서 막대와 칩이 넉넉하다)
const SCALES = [['month', '월'], ['week', '주']];

// 고른 날이 든 주의 일곱 칸 (일요일부터)
function weekCells(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const sunday = addDays(dateKey, -new Date(y, m - 1, d).getDay());
    return Array.from({ length: 7 }, (_, i) => {
        const key = addDays(sunday, i);
        return { key, date: Number(key.slice(8)), inMonth: true, dow: i };
    });
}

function Seg({ options, value, onChange, label }) {
    return (
        <div className="colorby" role="group" aria-label={label}>
            <span className="colorby-label">{label}</span>
            {options.map(([key, text]) => (
                <button key={key} type="button" aria-pressed={value === key}
                    className={`filter-btn${value === key ? ' active' : ''}`}
                    onClick={() => onChange(key)}>{text}</button>
            ))}
        </div>
    );
}

function Calendar({ todos: allTodos, dispatch, onOpenTodo, colorBy, onColorByChange }) {
    const tagStyle = useTagStyle();
    const todayKey = dayKey(useNow());
    const [selected, setSelected] = useState(todayKey);
    const [mode, setMode] = useLocalState('calView', 'due');
    const [scale, setScale] = useLocalState('calScale', 'month');
    const [view, setView] = useState(() => {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });
    const range = mode === 'range';
    const weekly = scale === 'week';
    const todos = allTodos.filter(todo => !todo.archived); // 보관한 건 달력에서도 치운다

    // 이전/다음: 월 눈금이면 한 달, 주 눈금이면 고른 날을 일주일 옮긴다
    function move(delta) {
        if (weekly) {
            const next = addDays(selected, delta * 7);
            setSelected(next);
            setView({ year: Number(next.slice(0, 4)), month: Number(next.slice(5, 7)) - 1 });
            return;
        }
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

    // 마감 보기: 날짜별 할 일 묶기 (마감일 있는 것만)
    const byDay = {};
    for (const todo of todos) {
        if (!todo.dueDate) continue;
        (byDay[todo.dueDate] ??= []).push(todo);
    }
    // 기간 보기: 시작일이 있는 것만. 층은 주 단위로 나눈다 (weekLanes)
    const ranges = range
        ? todos.map(todo => { const r = rangeOf(todo, todayKey); return r && { todo, ...r }; }).filter(Boolean)
        : [];

    const cells = weekly ? weekCells(selected) : monthCells(view.year, view.month);
    const holidays = holidaysForRange(cells[0].key, cells.at(-1).key); // 달력 칸이 해를 넘길 수 있다
    const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
    const maxChips = weekly ? 8 : 2;
    const [sy, sm, sd] = selected.split('-').map(Number);

    // 제목: 월 눈금은 "2026년 9월", 주 눈금은 "2026년 9월 13일 – 19일" (달을 넘으면 뒤에도 달을 쓴다)
    const title = weekly
        ? (() => {
            const a = cells[0].key, b = cells[6].key;
            const [ay, am, ad] = a.split('-').map(Number);
            const [by, bm, bd] = b.split('-').map(Number);
            return am === bm ? `${ay}년 ${am}월 ${ad}일 – ${bd}일` : `${ay}년 ${am}월 ${ad}일 – ${by !== ay ? `${by}년 ` : ''}${bm}월 ${bd}일`;
        })()
        : `${view.year}년 ${view.month + 1}월`;

    const dayTodos = sortByPriority(range
        ? ranges.filter(r => r.from <= selected && selected <= r.to).map(r => r.todo)
        : byDay[selected] ?? []);
    // 이 보기에 안 잡히는 남은 할 일 — 목록에서 바로 볼 수 있게
    const missing = todos.filter(todo => !todo.completed && !(range ? todo.startDate : todo.dueDate)).length;

    // 칸 안 칩·막대는 왼쪽 선 색만 바꾼다 — 우선순위 또는 첫 태그 (태그가 없으면 회색)
    const chipColor = (todo) => colorBy === 'tag'
        ? (todo.tags?.[0] ? tagStyle(todo.tags[0]) : { className: 'no-tag' })
        : { className: `priority-${priorityOf(todo)}` };

    // 고른 날짜에 추가 — 보기에 맞는 칸을 채운다 (마감 보기면 마감일, 기간 보기면 그날 하루)
    function addTodo(text, priority, date, tags) {
        const now = Date.now();
        const when = range ? { startDate: date, endDate: date } : { dueDate: date };
        dispatch({ type: 'ADD', todo: { id: now, text, completed: false, priority, createdAt: now, ...when, tags: tags?.length ? tags : undefined } });
    }

    return (
        <div className="calendar">
            <div className="cal-head">
                <h2 className="cal-title">{title}</h2>
                <div className="cal-nav">
                    {missing > 0 && (
                        <a href={`#todos?filter=active&${range ? 'range=none' : 'due=none'}`} className="ghost-btn"
                            title={`${range ? '시작일' : '마감일'}이 없는 남은 할 일을 목록에서 보기`}>
                            {range ? '시작일' : '마감'} 없음 {missing}
                        </a>
                    )}
                    <Seg label="눈금" options={SCALES} value={scale} onChange={setScale} />
                    <Seg label="보기" options={VIEWS} value={mode} onChange={setMode} />
                    <ColorByToggle value={colorBy} onChange={onColorByChange} />
                    <button type="button" className="ghost-btn" onClick={goToday}>오늘</button>
                    <button type="button" className="icon-btn" onClick={() => move(-1)} aria-label={weekly ? '지난 주' : '이전 달'}>‹</button>
                    <button type="button" className="icon-btn" onClick={() => move(1)} aria-label={weekly ? '다음 주' : '다음 달'}>›</button>
                </div>
            </div>

            {/* 칸과 막대가 같은 격자에 놓인다 — 막대는 여러 칸을 가로지르므로 자리를 직접 지정한다 */}
            <div className={`cal-grid mode-${mode} scale-${scale}`} role="group" aria-label={title}>
                {DOW.map((d, i) => <div key={d} className={`cal-dow dow-${i}`} aria-hidden="true">{d}</div>)}
                {weeks.map((week, wi) => {
                    const lanes = range ? weekLanes(ranges, week.map(c => c.key)) : [];
                    // 막대는 날짜 숫자 아래에서 시작한다. 공휴일 이름이 있는 주는 그 줄만큼 더 내린다.
                    const holidayRow = week.some(c => holidays.get(c.key));
                    return (
                        <Fragment key={week[0].key}>
                            {week.map((cell, col) => {
                                const items = byDay[cell.key] ?? [];
                                const holiday = holidays.get(cell.key);
                                const covering = lanes.reduce((n, lane) => n + lane.filter(s => s.startCol <= col && col <= s.endCol).length, 0);
                                const cls = ['cal-cell', `dow-${cell.dow}`];
                                if (!cell.inMonth) cls.push('out');
                                if (holiday) cls.push('holiday');
                                if (cell.key === todayKey) cls.push('today');
                                if (cell.key === selected) cls.push('selected');
                                return (
                                    <button type="button" key={cell.key} className={cls.join(' ')}
                                        style={{ gridRow: wi + 2, gridColumn: col + 1 }}
                                        aria-pressed={cell.key === selected} onClick={() => setSelected(cell.key)}
                                        aria-label={`${cell.key} ${DOW[cell.dow]}요일${holiday ? `, ${holiday}` : ''}, ${range ? '진행 중' : '할 일'} ${range ? covering : items.length}개`}>
                                        <span className="cal-date">{cell.date}</span>
                                        {holiday && <span className="cal-holiday" title={holiday}>{holiday}</span>}
                                        {!range && items.length > 0 && (
                                            <span className="cal-items">
                                                {items.slice(0, maxChips).map(todo => (
                                                    <span key={todo.id} style={chipColor(todo).style}
                                                        className={`cal-chip ${chipColor(todo).className}${todo.completed ? ' completed' : ''}`}>
                                                        {todo.text}
                                                    </span>
                                                ))}
                                                {items.length > maxChips && <span className="cal-more">+{items.length - maxChips}</span>}
                                                <span className="cal-dot" aria-hidden="true">{items.length}</span>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                            {lanes.flatMap((lane, li) => lane.map(seg => {
                                const color = chipColor(seg.todo);
                                const cls = ['cal-bar', color.className];
                                if (seg.todo.completed) cls.push('completed');
                                if (seg.openLeft) cls.push('open-left');
                                if (seg.openRight) cls.push('open-right');
                                if (seg.ongoing) cls.push('ongoing');
                                return (
                                    <button type="button" key={`${seg.todo.id}-${seg.startCol}`} className={cls.join(' ')}
                                        style={{
                                            ...color.style,
                                            gridRow: wi + 2,
                                            gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                                            '--lane': li,
                                            '--holiday-row': holidayRow ? 1 : 0,
                                        }}
                                        onClick={() => onOpenTodo(seg.todo.id)}
                                        title={`${seg.todo.text} — ${seg.from} ~ ${seg.ongoing ? '진행 중' : seg.to}`}>
                                        {seg.openLeft ? '⟵ ' : ''}{seg.todo.text}
                                    </button>
                                );
                            }))}
                        </Fragment>
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
                        <a href={`#todos?${range ? 'range' : 'due'}=${selected}`} className="link-btn">목록에서 보기</a>
                    )}
                </div>
                {dayTodos.length === 0
                    ? <p className="section-note">{range ? '이 날짜에 진행 중인 항목이 없어요.' : '이 날짜가 마감인 항목이 없어요.'}</p>
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
                <TodoForm onAddTodo={addTodo} fixedDue={selected}
                    placeholder={range ? '이 날짜에 시작하는 할 일 추가' : '이 날짜에 할 일 추가'} />
            </section>
        </div>
    );
}

export default Calendar;
