
function TodoFooter({ count, totCount, onClearCompleted}) {
    return (
        <div className="todo-footer">
            <p className="todo-total">전체 {totCount}개</p>
            <div className="todo-stamp" aria-label={`남은 할 일 ${count}개`}>
                <span className="stamp-count">{count}</span>
                <span className="stamp-label">남음</span>
            </div>
            <button className="clear-completed" onClick={onClearCompleted} disabled={count === totCount}>
                완료된 할 일 삭제
            </button>
        </div>
    );
}

export default TodoFooter;
