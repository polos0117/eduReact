import { PRIORITIES, PRIORITY_LABEL } from '../../reducers/todoReducer';

// 선택한 항목에 한 번에 적용하는 막대. 선택이 하나라도 있을 때만 나타난다.
function BulkBar({ count, allDone, onSetCompleted, onSetPriority, onRemove, onClear }) {
    return (
        <div className="bulk-bar" role="region" aria-label="선택한 항목 일괄 작업">
            <span className="bulk-count">{count}개 선택</span>
            <div className="bulk-actions">
                {allDone
                    ? <button type="button" className="bulk-btn" onClick={() => onSetCompleted(false)}>완료 취소</button>
                    : <button type="button" className="bulk-btn primary" onClick={() => onSetCompleted(true)}>완료 처리</button>}
                <label className="bulk-select">
                    <span className="sr-only">선택한 항목의 우선순위</span>
                    <select className="priority-select" defaultValue=""
                        onChange={(e) => { if (e.target.value) { onSetPriority(e.target.value); e.target.value = ''; } }}>
                        <option value="" disabled>우선순위…</option>
                        {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
                    </select>
                </label>
                <button type="button" className="bulk-btn danger" onClick={onRemove}>삭제</button>
                <button type="button" className="link-btn" onClick={onClear}>선택 해제</button>
            </div>
        </div>
    );
}

export default BulkBar;
