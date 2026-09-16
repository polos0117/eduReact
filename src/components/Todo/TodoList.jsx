import { useState } from "react";
import TodoItem from "./TodoItem";

// 빈 상태는 세 가지가 다르다: 아무것도 없음(처음) / 검색·조건에 안 걸림 / 이 보기에 없음
function TodoList({ todos, total, todayKey, selectedIds, onSelect, onToggleTodo, onRemoveTodo, onSetPriority, onOpenTodo,
    search, onClearSearch, filter, onShowAll, scoped, onAddSamples, manual, onMove, onRestore }) {
    // 끌어서 옮기기 — 어느 줄을 끌고 있고, 어느 줄의 앞/뒤에 놓을지. 직접 정렬일 때만 쓴다.
    const [dragId, setDragId] = useState(null);
    const [over, setOver] = useState(null); // { id, after }
    const drag = {
        onDragStart: (id) => setDragId(id),
        onDragOver: (id, after) => { if (dragId != null && id !== dragId) setOver({ id, after }); },
        onDrop: () => { if (dragId != null && over) onMove(dragId, over.id, over.after); setDragId(null); setOver(null); },
        onDragEnd: () => { setDragId(null); setOver(null); },
    };
    if (filter === 'archived' && total === 0) {
        return <p className="todo-empty">보관한 항목이 없어요. 끝낸 일은 아래 "완료 항목 보관"으로 치울 수 있어요.</p>;
    }
    if (total === 0) {
        return (
            <div className="todo-empty todo-guide">
                <p className="todo-guide-title">아직 비어 있어요</p>
                <ul className="todo-guide-list">
                    <li>위 칸에 제목을 적고 <kbd>Enter</kbd> — 끝에 <code>#태그</code>, <code>@내일</code>·<code>@금</code>·<code>@9/25</code> 를 붙이면 태그와 마감이 됩니다</li>
                    <li>제목을 누르면 상세 화면 — 하위 항목, 노트(코드·경로 붙여 넣기), 작업 화면 경로</li>
                    <li>앞의 네모는 선택(일괄 작업), 동그라미는 완료. 단축키는 설정에 있어요</li>
                </ul>
                <button type="button" className="link-btn" onClick={onAddSamples}>예시 세 개 넣어 보기</button>
            </div>
        );
    }
    if (todos.length === 0) {
        const trimmed = search.trim();
        return (
            <p className="todo-empty">
                {trimmed !== ''
                    ? <>‘{trimmed}’에 맞는 항목이 없어요. <button type="button" className="link-btn" onClick={onClearSearch}>검색 지우기</button></>
                    : scoped
                        ? <>이 조건에 맞는 항목이 없어요. <a href="#todos" className="link-btn">조건 지우기</a></>
                        : filter === 'completed'
                            ? '아직 끝낸 일이 없어요.'
                            : <>남은 일이 없어요 — 모두 끝냈어요. <button type="button" className="link-btn" onClick={onShowAll}>전체 보기</button></>}
            </p>
        );
    }
    return (
        <ul className="todo-list">
            {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} todayKey={todayKey}
                    manual={manual} dragging={dragId === todo.id} onRestore={onRestore}
                    dropHint={over?.id === todo.id ? (over.after ? 'after' : 'before') : null} {...drag}
                    selected={selectedIds.has(todo.id)} onSelect={onSelect}
                    onToggleTodo={onToggleTodo} onRemoveTodo={onRemoveTodo}
                    onSetPriority={onSetPriority} onOpenTodo={onOpenTodo} />
            ))}
        </ul>
    );
}

export default TodoList;
