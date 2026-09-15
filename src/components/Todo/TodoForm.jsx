import { useState, useRef } from "react";
import { PRIORITIES, PRIORITY_LABEL, parseTags } from "../../reducers/todoReducer";

// fixedDue가 있으면(캘린더에서 날짜를 고른 경우) 날짜 입력을 숨기고 그 날짜로 추가한다
// 제목 끝에 "#태그"를 붙이면 태그로 떼어낸다: "배포 준비 #kipa"
// 안내 문구는 짧게 — 칸이 좁으면 placeholder 가 잘려서 아무 말도 못 한다.
// #태그 설명은 title 로 옮겼다.
const TAG_HINT = '제목 끝에 #태그 를 붙이면 태그로 따로 저장됩니다. 예) 배포 준비 #kipa';

function TodoForm({ onAddTodo, fixedDue, placeholder = '할 일을 입력하고 Enter' }) {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState('normal');
    const [dueDate, setDueDate] = useState('');
    const inputRef = useRef(null);
    function handleSubmit(e) {
        e.preventDefault();
        if (text.trim() === '') return;
        const parsed = parseTags(text);
        onAddTodo(parsed.text, priority, fixedDue ?? dueDate, parsed.tags);
        setText('');
        setPriority('normal');
        setDueDate('');
        inputRef.current.focus();
    }
    return (
        <form onSubmit={handleSubmit} className="todo-form">
            <label htmlFor="new-todo" className="sr-only">새 할 일</label>
            <input id="new-todo" className="todo-input" placeholder={placeholder} title={TAG_HINT}
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
