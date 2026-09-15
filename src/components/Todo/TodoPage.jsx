import { useState } from "react";
import { sortByPriority, PRIORITY_LABEL } from "../../reducers/todoReducer";
import { dayKey, dueBucketOf, DUE_LABEL, formatDay } from "../../lib/stats";
import { useNow } from "../../hooks/useNow";
import TodoList from "./TodoList";
import TodoForm from "./TodoForm";
import TodoFooter from "./TodoFooter";
import TodoFilter from "./TodoFilter";

const DAY_MS = 24 * 3600 * 1000;

// "할 일" 탭. 상태는 App이 갖고, 여기서는 액션을 만들어 dispatch만 한다.
// params: 해시의 추가 조건 (대시보드·캘린더에서 넘어올 때) — filter / due / priority / done
function TodoPage({ todos, dispatch, params, onRemoveTodo, onOpenTodo }) {
    const [filter, setFilter] = useState(() => {
        const f = params.get('filter');
        return f === 'active' || f === 'completed' ? f : 'all';
    });
    const [search, setSearch] = useState('');
    const now = useNow();
    const todayKey = dayKey(now); // 마감 지남 판정 기준

    function addTodo(text, priority, dueDate) {
        const at = Date.now();
        dispatch({ type: 'ADD', todo: { id: at, text, completed: false, priority, createdAt: at, dueDate: dueDate || undefined } });
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

    // 해시에서 온 추가 조건. 칩으로 보여 주고, 같은 기준으로 거른다.
    const due = params.get('due');           // overdue|today|week|later|none|YYYY-MM-DD
    const priority = params.get('priority'); // high|normal|low
    const done = params.get('done');         // 7d (최근 n일) | YYYY-MM-DD (그날 완료)
    const scope = [];
    if (due) scope.push(DUE_LABEL[due] ?? `${formatDay(due, todayKey)} 마감`);
    if (priority && PRIORITY_LABEL[priority]) scope.push(`우선순위 ${PRIORITY_LABEL[priority]}`);
    if (done) scope.push(/^\d+d$/.test(done) ? `최근 ${parseInt(done)}일 완료` : `${formatDay(done, todayKey)} 완료`);

    function matchesScope(todo) {
        if (due && !(DUE_LABEL[due] ? dueBucketOf(todo, todayKey) === due : todo.dueDate === due)) return false;
        if (priority && (todo.priority ?? 'normal') !== priority) return false;
        if (done) {
            if (!todo.completed || !todo.completedAt) return false;
            if (/^\d+d$/.test(done)) return now - todo.completedAt < parseInt(done) * DAY_MS;
            return dayKey(todo.completedAt) === done;
        }
        return true;
    }

    // 검색은 제목과 노트 본문(붙여 넣은 코드 포함) 모두에서
    const searchText = search.trim().toLowerCase();
    function matchesSearch(todo) {
        if (searchText === '') return true;
        return todo.text.toLowerCase().includes(searchText)
            || (todo.notes ?? []).some(note => note.text.toLowerCase().includes(searchText));
    }
    const visibleTodos = sortByPriority(todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    }).filter(matchesScope).filter(matchesSearch));

    const doneCount = todos.filter(todo => todo.completed).length;
    const leftCount = todos.length - doneCount;

    return (
        <>
            <TodoForm onAddTodo={addTodo} />
            <TodoFilter currentFilter={filter} onFilterChange={setFilter} search={search} setSearch={setSearch}
                allDone={todos.length > 0 && leftCount === 0} onToggleAll={toggleAll} hasTodos={todos.length > 0} />
            {scope.length > 0 && (
                <div className="todo-scope" role="status">
                    {scope.map(label => <span key={label} className="scope-chip">{label}</span>)}
                    <span className="scope-count">{visibleTodos.length}개</span>
                    <a href="#todos" className="link-btn">조건 지우기</a>
                </div>
            )}
            <TodoList todos={visibleTodos} total={todos.length} todayKey={todayKey}
                onToggleTodo={toggleTodo} onRemoveTodo={onRemoveTodo} onSetPriority={setPriority} onOpenTodo={onOpenTodo} />
            <TodoFooter total={todos.length} done={doneCount} onClearCompleted={clearCompletedTodos} />
        </>
    );
}

export default TodoPage;
