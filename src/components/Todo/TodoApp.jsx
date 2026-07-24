import { useState } from "react";
import { useReducer } from "react";
import {useEffect} from "react";
import { todoReducer } from "../../reducers/todoReducer";
import TodoList from "./TodoList";
import TodoForm from "./TodoForm";
import TodoFooter from "./TodoFooter";
import TodoFilter from "./TodoFilter";

function TodoApp() {

    const [todos, setTodos] = useReducer(todoReducer, [], (initial) => {
        const storedTodos = localStorage.getItem('todos');
        return storedTodos ? JSON.parse(storedTodos) : initial;
    });
    const [filter, setFilter] = useState('all');

        useEffect(() => {
        try {
            localStorage.setItem('todos', JSON.stringify(todos));
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    },[todos]);


    function toggleTodo(id) {
        setTodos({ type: 'TOGGLE', id });
    }
    function removeTodo(id) {
        setTodos({ type: 'REMOVE', id });
    }

    function getFilteredTodos() {
        switch (filter) {
            case 'active':
                return todos.filter(todo => !todo.completed);
            case 'completed':
                return todos.filter(todo => todo.completed);
            default:
                return todos;
        }
    }
    function editTodo(id, newText) {
        setTodos({ type: 'EDIT', id, newText });
    }

    return (
        <div className="todo-app">
            <h1>할 일 목록</h1>
            <TodoForm onAddTodo={(text) => {
                const newTodo = {
                    id: Date.now(),
                    text: text,
                    completed: false
                };
                setTodos({ type: 'ADD', payload: newTodo });
            }}
            />
            <TodoFilter currentFilter={filter} onFilterChange={setFilter} />
            <TodoList todos={getFilteredTodos()}
            onToggleTodo={toggleTodo}
            onRemoveTodo={removeTodo}
            onEditTodo={editTodo}/>
            <TodoFooter totCount={todos.length} count={todos.filter(todo => !todo.completed).length} />
        </div>
    );
}

export default TodoApp;
