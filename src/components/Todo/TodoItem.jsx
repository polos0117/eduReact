import { PRIORITY_LABEL, priorityOf } from '../../reducers/todoReducer';
import { formatDay } from '../../lib/stats';

// 클릭할 때마다 보통 → 높음 → 낮음 → 보통
const NEXT_PRIORITY = { normal: 'high', high: 'low', low: 'normal' };

// 목록의 한 줄. 제목·마감일 편집은 상세 화면(제목 클릭)에서 한다.
function TodoItem({ todo, todayKey, onToggleTodo, onRemoveTodo, onSetPriority, onOpenTodo }) {
    const priority = priorityOf(todo);
    const overdue = todo.dueDate && !todo.completed && todo.dueDate < todayKey;
    const noteCount = todo.notes?.length ?? 0;

    return (
        <li className={`todo-item priority-${priority}${todo.completed ? ' completed' : ''}`}>
            <input type="checkbox" className="todo-item-checkbox" checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)} aria-label={`${todo.text} 완료`} />
            <button type="button" className="todo-item-text" onClick={() => onOpenTodo(todo.id)} title="상세 보기">
                {todo.text}
                {noteCount > 0 && <span className="note-count" aria-label={`노트 ${noteCount}개`}>≡ {noteCount}</span>}
            </button>
            {todo.dueDate && (
                <span className={`due-chip${overdue ? ' overdue' : ''}`}
                    title={overdue ? '마감 지남' : '마감일'}>{formatDay(todo.dueDate, todayKey)}</span>
            )}
            <button type="button" className="priority-btn"
                onClick={() => onSetPriority(todo.id, NEXT_PRIORITY[priority])}
                title={`우선순위: ${PRIORITY_LABEL[priority]} (눌러서 바꾸기)`}
                aria-label={`우선순위 ${PRIORITY_LABEL[priority]}, 눌러서 ${PRIORITY_LABEL[NEXT_PRIORITY[priority]]}으로`}>
                {PRIORITY_LABEL[priority]}
            </button>
            <div className="todo-item-actions">
                <button type="button" className="todo-item-btn" onClick={() => onRemoveTodo(todo.id)}>삭제</button>
            </div>
        </li>
    );
}

export default TodoItem;
