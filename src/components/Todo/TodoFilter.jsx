
function TodoFilter({ currentFilter, onFilterChange, search, setSearch }) {
    return (
        <div className="todo-filter">
            <input className="todo-search" type="text" placeholder="검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className={`filter-btn${currentFilter === 'all' ? ' active' : ''}`} onClick={() => onFilterChange('all')} disabled={currentFilter === 'all'}>전체</button>
            <button className={`filter-btn${currentFilter === 'active' ? ' active' : ''}`} onClick={() => onFilterChange('active')} disabled={currentFilter === 'active'}>진행중</button>
            <button className={`filter-btn${currentFilter === 'completed' ? ' active' : ''}`} onClick={() => onFilterChange('completed')} disabled={currentFilter === 'completed'}>완료</button>
        </div>
    );
}

export default TodoFilter;
