import type { Todo } from '../../types/Todo';
import { useState } from 'react';

interface TodoItemProps {
    todo: Todo;
    onToggleTodo: (id: number) => void;
    onRemoveTodo: (id: number) => void;
    onEditTodo: (id: number, newText: string) => void;
}

function TodoItem({ todo, onToggleTodo, onRemoveTodo, onEditTodo }: TodoItemProps) {
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleEdit();
                            }
                        }}
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
                            <button className="todo-item-btn" onClick={() => setIsEditing(true)}>수정</button>
                            <button className="todo-item-btn danger" onClick={() => onRemoveTodo(todo.id)}>삭제</button>
                        </div>
                    </>
                )}
            </li>
    );
}

export default TodoItem;
