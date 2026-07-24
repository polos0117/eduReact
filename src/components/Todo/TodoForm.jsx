import { useState } from "react";

function TodoForm({ onAddTodo }) {
const [text, setText] = useState('');
 return (
    <form onSubmit={(e) => {
        e.preventDefault();
        const trimmedText = text.trim();
        if (trimmedText === '') {
            return;
        }
        onAddTodo(trimmedText);
        setText('');
        }} className="todo-form">
        <input className="todo-input" placeholder="할 일을 입력하세요" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="todo-add-btn" type="submit">추가</button>
    </form>
)}

export default TodoForm;
