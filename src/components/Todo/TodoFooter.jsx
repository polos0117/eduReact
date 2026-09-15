function TodoFooter({ total, done, onClearCompleted }) {
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return (
        <footer className="todo-footer">
            <div className="todo-progress" role="progressbar" aria-label="완료 진행률"
                aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="todo-progress-bar" style={{ width: `${percent}%` }} />
            </div>
            <div className="todo-footer-row">
                <span className="todo-count">{done} / {total} 완료</span>
                <button type="button" className="link-btn" onClick={onClearCompleted} disabled={done === 0}>
                    완료 항목 지우기
                </button>
            </div>
        </footer>
    );
}

export default TodoFooter;
