import { useState } from "react";
import { sortByPriority } from "../../reducers/todoReducer";
import { dayKey } from "../../lib/stats";
import TodoList from "./TodoList";
import TodoForm from "./TodoForm";
import TodoFooter from "./TodoFooter";
import TodoFilter from "./TodoFilter";

// "할 일" 탭. 상태는 App이 갖고, 여기서는 액션을 만들어 dispatch만 한다.
function TodoPage({ todos, dispatch, onRemoveTodo, onOpenTodo }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [todayKey] = useState(() => dayKey(Date.now())); // 마감 지남 판정 기준

    function addTodo(text, priority, dueDate) {
        const now = Date.now();
        dispatch({ type: 'ADD', todo: { id: now, text, completed: false, priority, createdAt: now, dueDate: dueDate || undefined } });
    }
    function toggleTodo(id) {
        dispatch({ type: 'TOGGLE', id, at: Date.now() });
    }
    function toggleAll() {
        dispatch({ type: 'TOGGLE_ALL', at: Date.now() });
    }
    function clearCompletedTodos() {
        dispatch({ type: 'CLEAR_COMPLETED' });
    }
    function editTodo(id, newText, dueDate) {
        dispatch({ type: 'EDIT', id, newText });
        dispatch({ type: 'SET_DUE', id, dueDate });
    }
    function setPriority(id, priority) {
        dispatch({ type: 'SET_PRIORITY', id, priority });
    }

    const searchText = search.trim().toLowerCase();
    const visibleTodos = sortByPriority(todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    }).filter(todo => todo.text.toLowerCase().includes(searchText)));

    const doneCount = todos.filter(todo => todo.completed).length;
    const leftCount = todos.length - doneCount;

    return (
        <>
            <TodoForm onAddTodo={addTodo} />
            <TodoFilter currentFilter={filter} onFilterChange={setFilter} search={search} setSearch={setSearch}
                allDone={todos.length > 0 && leftCount === 0} onToggleAll={toggleAll} hasTodos={todos.length > 0} />
            <TodoList todos={visibleTodos} total={todos.length} todayKey={todayKey}
                onToggleTodo={toggleTodo} onRemoveTodo={onRemoveTodo} onEditTodo={editTodo} onSetPriority={setPriority}
                onOpenTodo={onOpenTodo} />
            <TodoFooter total={todos.length} done={doneCount} onClearCompleted={clearCompletedTodos} />
        </>
    );
}

export default TodoPage;
