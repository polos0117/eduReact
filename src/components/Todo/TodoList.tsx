import type { Todo } from "../../types/Todo";
import TodoItem from "./TodoItem";

interface TodoListProps {
    todos : Todo[];
    onToggleTodo: (id: number) => void;
    onRemoveTodo: (id: number) => void;
    onEditTodo: (id: number, newText: string) => void;
} 

function TodoList({ todos, onToggleTodo, onRemoveTodo, onEditTodo }: TodoListProps) {
    return (
        <ul className="todo-list">
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggleTodo={onToggleTodo}
                    onRemoveTodo={onRemoveTodo}
                    onEditTodo={onEditTodo}
                />
            ))}
        </ul>
    );
}

export default TodoList;
