import { useState } from "react";
import { sortByPriority, PRIORITY_LABEL } from "../../reducers/todoReducer";
import { dayKey, dueBucketOf, DUE_LABEL, formatDay } from "../../lib/stats";
import { useNow } from "../../hooks/useNow";
import TodoList from "./TodoList";
import TodoForm from "./TodoForm";
import TodoFooter from "./TodoFooter";
import TodoFilter from "./TodoFilter";
import BulkBar from "./BulkBar";

const DAY_MS = 24 * 3600 * 1000;

// "할 일" 탭. 상태는 App이 갖고, 여기서는 액션을 만들어 dispatch만 한다.
// params: 해시의 추가 조건 (대시보드·캘린더에서 넘어올 때) — filter / due / priority / done / tag
function TodoPage({ todos, dispatch, params, onRemoveTodo, onRemoveMany, onOpenTodo }) {
    const [filter, setFilter] = useState(() => {
        const f = params.get('filter');
        return f === 'active' || f === 'completed' ? f : 'all';
    });
    const [search, setSearch] = useState('');
    // 선택은 화면에만 있는 상태다 — 저장하지 않고, 조건이 바뀌면(App이 key로 재마운트) 비워진다
    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const now = useNow();
    const todayKey = dayKey(now); // 마감 지남 판정 기준

    function addTodo(text, priority, dueDate, tags) {
        const at = Date.now();
        dispatch({ type: 'ADD', todo: { id: at, text, completed: false, priority, createdAt: at, dueDate: dueDate || undefined, tags: tags?.length ? tags : undefined } });
    }
    function toggleTodo(id) {
        dispatch({ type: 'TOGGLE', id, at: Date.now() });
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
    const tag = params.get('tag');
    const scope = [];
    if (tag) scope.push(`#${tag}`);
    if (due) scope.push(DUE_LABEL[due] ?? `${formatDay(due, todayKey)} 마감`);
    if (priority && PRIORITY_LABEL[priority]) scope.push(`우선순위 ${PRIORITY_LABEL[priority]}`);
    if (done) scope.push(/^\d+d$/.test(done) ? `최근 ${parseInt(done)}일 완료` : `${formatDay(done, todayKey)} 완료`);

    function matchesScope(todo) {
        if (tag && !(todo.tags ?? []).includes(tag)) return false;
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

    // 화면에서 사라진 항목은 선택에서도 빼고 센다 (지웠거나 조건에서 빠졌을 때)
    const visibleIds = visibleTodos.map(todo => todo.id);
    const selected = visibleIds.filter(id => selectedIds.has(id));
    const allSelected = visibleIds.length > 0 && selected.length === visibleIds.length;

    function toggleSelect(id) {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }
    function toggleSelectAll() {
        setSelectedIds(allSelected ? new Set() : new Set(visibleIds));
    }
    const clearSelection = () => setSelectedIds(new Set());

    function bulkPriority(value) {
        dispatch({ type: 'SET_PRIORITY_MANY', ids: selected, priority: value });
    }
    function bulkRemove() {
        onRemoveMany(selected);
        clearSelection();
    }

    const doneCount = todos.filter(todo => todo.completed).length;
    const selectedAllDone = selected.length > 0 && selected.every(id => todos.find(todo => todo.id === id)?.completed);

    return (
        <>
            <TodoForm onAddTodo={addTodo} />
            <TodoFilter currentFilter={filter} onFilterChange={setFilter} search={search} setSearch={setSearch}
                allSelected={allSelected} someSelected={selected.length > 0 && !allSelected}
                onToggleSelectAll={toggleSelectAll} hasVisible={visibleIds.length > 0} />
            {selected.length > 0 && (
                <BulkBar count={selected.length} allDone={selectedAllDone}
                    onSetCompleted={(completed) => dispatch({ type: 'SET_COMPLETED_MANY', ids: selected, completed, at: Date.now() })}
                    onSetPriority={bulkPriority}
                    onRemove={bulkRemove} onClear={clearSelection} />
            )}
            {scope.length > 0 && (
                <div className="todo-scope" role="status">
                    {scope.map(label => <span key={label} className="scope-chip">{label}</span>)}
                    <span className="scope-count">{visibleTodos.length}개</span>
                    <a href="#todos" className="link-btn">조건 지우기</a>
                </div>
            )}
            <TodoList todos={visibleTodos} total={todos.length} todayKey={todayKey}
                selectedIds={selectedIds} onSelect={toggleSelect}
                onToggleTodo={toggleTodo} onRemoveTodo={onRemoveTodo} onSetPriority={setPriority} onOpenTodo={onOpenTodo} />
            <TodoFooter total={todos.length} done={doneCount} onClearCompleted={clearCompletedTodos} />
        </>
    );
}

export default TodoPage;
