
function TodoFooter({ count, totCount }) {
    return (
        <div className="todo-footer">
            <p className="todo-total">전체 {totCount}개</p>
            <div className="todo-stamp" aria-label={`남은 할 일 ${count}개`}>
                <span className="stamp-count">{count}</span>
                <span className="stamp-label">남음</span>
            </div>
        </div>
    );
}

export default TodoFooter;
