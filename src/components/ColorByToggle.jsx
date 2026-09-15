// 대시보드·캘린더의 색 기준 전환. 두 화면이 같은 설정을 공유한다.
const OPTIONS = [['priority', '우선순위'], ['tag', '태그']];

function ColorByToggle({ value, onChange }) {
    return (
        <div className="colorby" role="group" aria-label="색 기준">
            <span className="colorby-label">색</span>
            {OPTIONS.map(([key, label]) => (
                <button key={key} type="button" aria-pressed={value === key}
                    className={`filter-btn${value === key ? ' active' : ''}`}
                    onClick={() => onChange(key)}>{label}</button>
            ))}
        </div>
    );
}

export default ColorByToggle;
