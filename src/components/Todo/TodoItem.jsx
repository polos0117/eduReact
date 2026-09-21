import { PRIORITIES, PRIORITY_LABEL, priorityOf, subtaskProgress } from '../../reducers/todoReducer';
import { formatDay } from '../../lib/stats';
import { holidayOn } from '../../lib/holidays';
import { tagHref } from '../../lib/tags';
import { useTagStyle } from '../../hooks/useTagColors';
import DoneButton from './DoneButton';

// 목록의 한 줄. 앞의 네모 체크박스는 "선택"이고, 완료는 동그란 ✓ 버튼이 한다.
// 제목·마감일 편집은 상세 화면(제목 클릭)에서.
function TodoItem({ todo, todayKey, selected, onSelect, onToggleTodo, onRemoveTodo, onSetPriority, onOpenTodo,
    manual, dragging, dropHint, onDragStart, onDragOver, onDrop, onDragEnd, onRestore }) {
    const tagStyle = useTagStyle();
    const priority = priorityOf(todo);
    const overdue = todo.dueDate && !todo.completed && todo.dueDate < todayKey;
    const dueHoliday = holidayOn(todo.dueDate);
    const noteCount = todo.notes?.length ?? 0;
    const sub = subtaskProgress(todo);

    return (
        <li data-id={todo.id}
            className={`todo-item priority-${priority}${todo.completed ? ' completed' : ''}${selected ? ' selected' : ''}${overdue ? ' overdue' : ''}${dragging ? ' dragging' : ''}${dropHint ? ` drop-${dropHint}` : ''}${todo.archived ? ' archived' : ''}`}
            onDragOver={manual ? (e) => { e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(); onDragOver(todo.id, e.clientY > r.top + r.height / 2); } : undefined}
            onDrop={manual ? (e) => { e.preventDefault(); onDrop(); } : undefined}>
            {/* 좁은 화면에서는 main 이 한 줄을 다 쓰고 meta 가 아래로 내려간다 */}
            <div className="todo-item-main">
                {/* 직접 정렬일 때만 손잡이. 줄 전체를 draggable 로 하면 체크박스·셀렉트 조작이 끌기로 먹혀서 손잡이만 */}
                {manual && (
                    <span className="drag-grip" draggable title="끌어서 순서 바꾸기 (Alt+↑ ↓)" aria-hidden="true"
                        onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', String(todo.id));
                            e.dataTransfer.setDragImage(e.currentTarget.closest('.todo-item'), 24, 24);
                            onDragStart(todo.id);
                        }}
                        onDragEnd={onDragEnd}>⠿</span>
                )}
                <input type="checkbox" className="todo-item-checkbox" checked={selected}
                    onChange={() => onSelect(todo.id)} aria-label={`${todo.text} 선택`} title="선택" />
                <DoneButton completed={todo.completed} label={todo.text} onToggle={() => onToggleTodo(todo.id)} />
                <button type="button" className="todo-item-text" onClick={() => onOpenTodo(todo.id)} title="상세 보기">
                    {todo.text}
                    {noteCount > 0 && <span className="note-count" aria-label={`노트 ${noteCount}개`}>≡ {noteCount}</span>}
                    {sub.total > 0 && (
                        <span className={`note-count sub-count${sub.done === sub.total ? ' all-done' : ''}`}
                            aria-label={`하위 항목 ${sub.total}개 중 ${sub.done}개 완료`}>☑ {sub.done}/{sub.total}</span>
                    )}
                </button>
            </div>
            <div className="todo-item-meta">
                {/* 태그는 한 칸에 묶는다 — 개수가 달라도 옆 칸(기간·마감)이 밀리지 않게 */}
                <span className="todo-item-tags">
                    {todo.tags?.map(tag => (
                        <a key={tag} {...tagStyle(tag)} className={`tag-chip ${tagStyle(tag).className}`}
                            href={tagHref(tag)} title={`#${tag} 항목만 보기`}>#{tag}</a>
                    ))}
                </span>
                {todo.startDate && (
                    <span className="range-chip" title={`실제 기간 ${todo.startDate} ~ ${todo.endDate ?? '진행 중'}`}>
                        {formatDay(todo.startDate, todayKey)}~{todo.endDate ? formatDay(todo.endDate, todayKey) : ''}
                    </span>
                )}
                {todo.dueDate && (
                    <span className={`due-chip${overdue ? ' overdue' : ''}${dueHoliday ? ' on-holiday' : ''}`}
                        title={`${overdue ? '마감 지남' : '마감일'}${dueHoliday ? ` · ${dueHoliday} (공휴일)` : ''}`}>
                        {formatDay(todo.dueDate, todayKey)}</span>
                )}
                <select className={`priority-select priority-${priority}`} value={priority}
                    onChange={(e) => onSetPriority(todo.id, e.target.value)}
                    aria-label={`${todo.text} 우선순위`} title="우선순위">
                    {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
                </select>
            </div>
            <div className="todo-item-actions">
                {todo.archived && <button type="button" className="todo-item-btn" onClick={() => onRestore(todo.id)}>복원</button>}
                <button type="button" className="todo-item-btn" onClick={() => onRemoveTodo(todo.id)}>삭제</button>
            </div>
        </li>
    );
}

export default TodoItem;
