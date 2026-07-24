
interface TodoFilterProps {
    currentFilter: 'all' | 'active' | 'completed';
    onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}


function TodoFilter({ currentFilter, onFilterChange }: TodoFilterProps) {
    return (
        <div className="todo-filter">
            <button className={`filter-btn${currentFilter === 'all' ? ' active' : ''}`} onClick={() => onFilterChange('all')} disabled={currentFilter === 'all'}>전체</button>
            <button className={`filter-btn${currentFilter === 'active' ? ' active' : ''}`} onClick={() => onFilterChange('active')} disabled={currentFilter === 'active'}>진행중</button>
            <button className={`filter-btn${currentFilter === 'completed' ? ' active' : ''}`} onClick={() => onFilterChange('completed')} disabled={currentFilter === 'completed'}>완료</button>
        </div>
    );
}

export default TodoFilter;