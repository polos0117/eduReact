const FILTERS = [['all', '전체'], ['active', '진행중'], ['completed', '완료']];

function TodoFilter({ currentFilter, onFilterChange, search, setSearch, allDone, onToggleAll, hasTodos }) {
    return (
        <div className="todo-filter">
            <input type="checkbox" className="todo-item-checkbox toggle-all" checked={allDone}
                onChange={onToggleAll} disabled={!hasTodos} aria-label="전체 완료 / 해제" title="전체 완료 / 해제" />
            <div className="filter-tabs" role="group" aria-label="보기">
                {FILTERS.map(([key, label]) => (
                    <button key={key} type="button" aria-pressed={currentFilter === key}
                        className={`filter-btn${currentFilter === key ? ' active' : ''}`}
                        onClick={() => onFilterChange(key)}>{label}</button>
                ))}
            </div>
            <input className="todo-search" type="search" placeholder="검색" aria-label="제목과 노트 검색"
                value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
    );
}

export default TodoFilter;
