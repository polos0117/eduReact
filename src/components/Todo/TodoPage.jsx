import { useState } from "react";
import { sortByPriority } from "../../reducers/todoReducer";
import { dayKey } from "../../lib/stats";
import { useNow } from "../../hooks/useNow";
import TodoList from "./TodoList";
import TodoForm from "./TodoForm";
import TodoFooter from "./TodoFooter";
import TodoFilter from "./TodoFilter";

// "할 일" 탭. 상태는 App이 갖고, 여기서는 액션을 만들어 dispatch만 한다.
function TodoPage({ todos, dispatch, onRemoveTodo, onOpenTodo }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const todayKey = dayKey(useNow()); // 마감 지남 판정 기준

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
    function setPriority(id, priority) {
        dispatch({ type: 'SET_PRIORITY', id, priority });
    }

    // 검색은 제목과 노트 본문(붙여 넣은 코드 포함) 모두에서
    const searchText = search.trim().toLowerCase();
    function matches(todo) {
        if (searchText === '') return true;
        return todo.text.toLowerCase().includes(searchText)
            || (todo.notes ?? []).some(note => note.text.toLowerCase().includes(searchText));
    }
    const visibleTodos = sortByPriority(todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    }).filter(matches));

    const doneCount = todos.filter(todo => todo.completed).length;
    const leftCount = todos.length - doneCount;

    return (
        <>
            <TodoForm onAddTodo={addTodo} />
            <TodoFilter currentFilter={filter} onFilterChange={setFilter} search={search} setSearch={setSearch}
                allDone={todos.length > 0 && leftCount === 0} onToggleAll={toggleAll} hasTodos={todos.length > 0} />
            <TodoList todos={visibleTodos} total={todos.length} todayKey={todayKey}
                onToggleTodo={toggleTodo} onRemoveTodo={onRemoveTodo} onSetPriority={setPriority} onOpenTodo={onOpenTodo} />
            <TodoFooter total={todos.length} done={doneCount} onClearCompleted={clearCompletedTodos} />
        </>
    );
}

export default TodoPage;
