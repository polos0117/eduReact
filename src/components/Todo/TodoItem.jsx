import { useState } from 'react';

function TodoItem({ todo, onToggleTodo, onRemoveTodo, onEditTodo }) {
    console.log(`TodoItem rendered: ${todo.text}`);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    function handleEdit() {
        const trimmed = editText.trim();
        if (trimmed === '') {
            setIsEditing(false);
            return;
        }
        onEditTodo(todo.id, trimmed);
        setIsEditing(false);
    }
    function startEditing() {
        setEditText(todo.text);
        setIsEditing(true);
    }
    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            handleEdit();
        }
        else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    }   
    return (
            <li className={`todo-item${todo.completed ? ' completed' : ''}`}>
                {isEditing ? (
                    <input
                        className="todo-item-edit-input"
                        type="text"
                        value={editText}
                        autoFocus
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => {
                            handleEdit();
                        }}
                        onKeyDown={handleKeyDown}
                    />
                ) : (
                    <>
                        <input
                            type="checkbox"
                            className="todo-item-checkbox"
                            checked={todo.completed}
                            onChange={() => onToggleTodo(todo.id)}
                        />
                        <span className="todo-item-text">{todo.text}</span>
                        <div className="todo-item-actions">
                            <button className="todo-item-btn" onClick={startEditing}>수정</button>
                            <button className="todo-item-btn danger" onClick={() => onRemoveTodo(todo.id)}>삭제</button>
                        </div>
                    </>
                )}
            </li>
    );
}

export default TodoItem;
