import { useState } from "react";
import { todoReducer } from "../../reducers/todoReducer";
import { usePersistedReducer } from "../../hooks/usePersistedReducer";
import TodoList from "./TodoList";
import TodoForm from "./TodoForm";
import TodoFooter from "./TodoFooter";
import TodoFilter from "./TodoFilter";
import TodoSuggestions from "./TodoSuggestions";

function TodoApp() {
    const [todos, dispatch] = usePersistedReducer(todoReducer, 'todos', []);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    function addTodo(text) {
        const newTodo = {
            id: Date.now(),
            text,
            completed: false
        };
        dispatch({ type: 'ADD', todo: newTodo });
    }

    function toggleTodo(id) {
        dispatch({ type: 'TOGGLE', id });
    }
    function removeTodo(id) {
        dispatch({ type: 'REMOVE', id });
    }
    function clearCompletedTodos() {
        dispatch({ type: 'CLEAR_COMPLETED' });
    }
    function editTodo(id, newText) {
        dispatch({ type: 'EDIT', id, newText });
    }
    const searchText = search.trim().toLowerCase();
    const visibleTodos = todos.filter(todo => {
        if (filter === 'active') {
            return !todo.completed;
        } else if (filter === 'completed') {
            return todo.completed;
        }
        return true;    
    }).filter(todo => todo.text.toLowerCase().includes(searchText));
    


    return (
        <div className="todo-app">
            <h1>할 일 목록</h1>
            <TodoForm onAddTodo={addTodo}/>
            <TodoFilter currentFilter={filter} onFilterChange={setFilter} search={search} setSearch={setSearch} />
            <TodoList todos={visibleTodos}
            onToggleTodo={toggleTodo}
            onRemoveTodo={removeTodo}
            onEditTodo={editTodo}/>
            <TodoFooter totCount={todos.length} count={todos.filter(todo => !todo.completed).length} onClearCompleted={clearCompletedTodos} />
            <TodoSuggestions></TodoSuggestions>
        </div>
    );
}

export default TodoApp;
