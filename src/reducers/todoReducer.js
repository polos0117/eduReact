export function todoReducer(state, action) {
    switch (action.type) {
        case 'ADD': return [...state, action.todo];
        case 'TOGGLE': return state.map(todo =>
            todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        );
        case 'REMOVE': return state.filter(todo => todo.id !== action.id);
        case 'CLEAR_COMPLETED' : return state.filter(todo => !todo.completed);
        case 'EDIT': return state.map(todo =>
            todo.id === action.id ? { ...todo, text: action.newText } : todo
        );


        default: return state;
    }
}
