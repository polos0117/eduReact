import { useState, useRef } from "react";

function TodoForm({ onAddTodo }) {
const [text, setText] = useState('');
const inputRef = useRef(null);
function handleSubmit(e) {
    e.preventDefault();
    const trimmedText = text.trim();
    if (trimmedText === '') {
        return;
    }
    onAddTodo(trimmedText);
    setText('');
    inputRef.current.focus();
}
 return (
    <form onSubmit={handleSubmit} className="todo-form">
        <input className="todo-input" placeholder="할 일을 입력하세요" value={text} onChange={(e) => setText(e.target.value)} ref={inputRef} />
        <button className="todo-add-btn" type="submit">추가</button>
    </form>
)}

export default TodoForm;
