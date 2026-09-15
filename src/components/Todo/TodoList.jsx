import TodoItem from "./TodoItem";

function TodoList({ todos, total, todayKey, onToggleTodo, onRemoveTodo, onEditTodo, onSetPriority, onOpenTodo }) {
    if (total === 0) {
        return <p className="todo-empty">아직 할 일이 없어요. 위 칸에 첫 항목을 추가해 보세요.</p>;
    }
    if (todos.length === 0) {
        return <p className="todo-empty">검색이나 보기 조건에 맞는 항목이 없어요.</p>;
    }
    return (
        <ul className="todo-list">
            {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} todayKey={todayKey} onToggleTodo={onToggleTodo}
                    onRemoveTodo={onRemoveTodo} onEditTodo={onEditTodo} onSetPriority={onSetPriority} onOpenTodo={onOpenTodo} />
            ))}
        </ul>
    );
}

export default TodoList;
