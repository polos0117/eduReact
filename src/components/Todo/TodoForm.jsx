import { useState, useRef } from "react";
import { PRIORITIES, PRIORITY_LABEL } from "../../reducers/todoReducer";

// fixedDue가 있으면(캘린더에서 날짜를 고른 경우) 날짜 입력을 숨기고 그 날짜로 추가한다
function TodoForm({ onAddTodo, fixedDue, placeholder = '새 할 일 — 제목을 입력하고 Enter' }) {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState('normal');
    const [dueDate, setDueDate] = useState('');
    const inputRef = useRef(null);
    function handleSubmit(e) {
        e.preventDefault();
        const trimmedText = text.trim();
        if (trimmedText === '') return;
        onAddTodo(trimmedText, priority, fixedDue ?? dueDate);
        setText('');
        setPriority('normal');
        setDueDate('');
        inputRef.current.focus();
    }
    return (
        <form onSubmit={handleSubmit} className="todo-form">
            <label htmlFor="new-todo" className="sr-only">새 할 일</label>
            <input id="new-todo" className="todo-input" placeholder={placeholder}
                value={text} onChange={(e) => setText(e.target.value)} ref={inputRef} autoComplete="off" />
            {!fixedDue && (
                <input type="date" className="due-input" aria-label="마감일" title="마감일"
                    value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            )}
            <select className={`priority-select priority-${priority}`} value={priority} aria-label="우선순위"
                onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </select>
            <button className="todo-add-btn" type="submit" disabled={text.trim() === ''}>추가</button>
        </form>
    );
}

export default TodoForm;
