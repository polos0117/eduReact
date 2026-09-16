// 목록 바닥 — 진행률과 보관. "지우기" 대신 "보관": 목록에서만 치우고 통계엔 남긴다.
// 보관 보기에서는 비우기(삭제, 되돌리기 가능)로 바뀐다.
function TodoFooter({ total, done, filter, archivedCount, onArchiveCompleted, onShowArchived, onClearArchived }) {
    const archive = filter === 'archived';
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return (
        <footer className="todo-footer">
            <div className="todo-progress" role="progressbar" aria-label="완료 진행률"
                aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="todo-progress-bar" style={{ width: `${percent}%` }} />
            </div>
            <div className="todo-footer-row">
                <span className="todo-count">{archive ? `보관 ${total}개` : `${done} / ${total} 완료`}</span>
                <span className="todo-footer-actions">
                    {archive
                        ? <button type="button" className="link-btn" onClick={onClearArchived} disabled={total === 0}>보관함 비우기</button>
                        : (
                            <>
                                {archivedCount > 0 && (
                                    <button type="button" className="link-btn" onClick={onShowArchived}>보관 {archivedCount}</button>
                                )}
                                <button type="button" className="link-btn" onClick={onArchiveCompleted} disabled={done === 0}>
                                    완료 항목 보관
                                </button>
                            </>
                        )}
                </span>
            </div>
        </footer>
    );
}

export default TodoFooter;
