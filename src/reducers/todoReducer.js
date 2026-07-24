export function todoReducer(state, action) {
    switch (action.type) {
        case 'ADD': return [...state, action.payload];
        case 'TOGGLE': return state.map(todo =>
            todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        );
        case 'REMOVE': return state.filter(todo => todo.id !== action.id);
        case 'EDIT': return state.map(todo =>
            todo.id === action.id ? { ...todo, text: action.newText } : todo
        );
        default: return state;
    }
}
