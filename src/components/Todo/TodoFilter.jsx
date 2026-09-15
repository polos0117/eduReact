import { SORTS } from "../../reducers/todoReducer";

const FILTERS = [['all', '전체'], ['active', '진행중'], ['completed', '완료']];

function TodoFilter({ currentFilter, onFilterChange, search, setSearch, sort, onSortChange,
    allSelected, someSelected, onToggleSelectAll, hasVisible }) {
    return (
        <div className="todo-filter">
            {/* 보이는 항목 전체 선택. 일부만 골랐으면 중간 상태로 */}
            <input type="checkbox" className="todo-item-checkbox toggle-all" checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected; }}
                onChange={onToggleSelectAll} disabled={!hasVisible}
                aria-label="보이는 항목 전체 선택" title="보이는 항목 전체 선택" />
            <div className="filter-tabs" role="group" aria-label="보기">
                {FILTERS.map(([key, label]) => (
                    <button key={key} type="button" aria-pressed={currentFilter === key}
                        className={`filter-btn${currentFilter === key ? ' active' : ''}`}
                        onClick={() => onFilterChange(key)}>{label}</button>
                ))}
            </div>
            <select className="priority-select sort-select" value={sort} aria-label="정렬" title="정렬"
                onChange={(e) => onSortChange(e.target.value)}>
                {SORTS.map(([key, label]) => <option key={key} value={key}>{label}순</option>)}
            </select>
            <input className="todo-search" type="search" placeholder="검색" aria-label="제목과 노트 검색"
                value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
    );
}

export default TodoFilter;
