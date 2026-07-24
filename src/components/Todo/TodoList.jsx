import TodoItem from "./TodoItem";

function TodoList({ todos, onToggleTodo, onRemoveTodo, onEditTodo }) {
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
