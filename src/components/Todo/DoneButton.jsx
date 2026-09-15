// 완료 처리 버튼. 목록의 네모 체크박스(= 선택)와 구분되게 동그란 체크 버튼이다.
function DoneButton({ completed, onToggle, label }) {
    return (
        <button type="button" className={`done-btn${completed ? ' is-done' : ''}`} onClick={onToggle}
            aria-pressed={completed}
            title={completed ? '완료 취소' : '완료 처리'}
            aria-label={`${label} ${completed ? '완료 취소' : '완료 처리'}`}>
            <span aria-hidden="true">✓</span>
        </button>
    );
}

export default DoneButton;
