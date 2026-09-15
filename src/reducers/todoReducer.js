// 우선순위: 정렬 순서와 라벨을 여기서 한 번만 정의한다
export const PRIORITIES = ['high', 'normal', 'low'];
export const PRIORITY_LABEL = { high: '높음', normal: '보통', low: '낮음' };

// 예전에 저장된 todo에는 priority가 없을 수 있다 → 보통으로 본다
export function priorityOf(todo) {
    return todo.priority ?? 'normal';
}

// 초기 버전은 id가 Date.now()였으므로 createdAt이 없으면 id를 생성 시각으로 쓴다
export function createdAtOf(todo) {
    return todo.createdAt ?? todo.id;
}

// 높음 → 보통 → 낮음 순, 같은 우선순위끼리는 원래 순서 유지 (sort는 안정 정렬)
export function sortByPriority(todos) {
    return [...todos].sort((a, b) => PRIORITIES.indexOf(priorityOf(a)) - PRIORITIES.indexOf(priorityOf(b)));
}

// 상세 노트 분류. 개발 작업을 백/프론트로 나눠 붙여 넣는 용도
export const NOTE_CATEGORIES = ['backend', 'frontend', 'memo'];
export const NOTE_LABEL = { backend: '백엔드', frontend: '프론트엔드', memo: '메모' };

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

function normalizeNote(raw, now) {
    if (!raw || typeof raw !== 'object' || typeof raw.text !== 'string' || raw.text.trim() === '') return null;
    return {
        id: Number.isFinite(raw.id) ? raw.id : now,
        category: NOTE_CATEGORIES.includes(raw.category) ? raw.category : 'memo',
        text: raw.text, // 코드 붙여넣기: 앞뒤 공백·들여쓰기 그대로 둔다
        createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : now,
    };
}

// 밖에서 들어온 JSON은 믿지 않는다. 모양이 맞는 것만 남기고, 빠진 필드는 채운다.
export function normalizeTodo(raw, now = Date.now()) {
    if (!raw || typeof raw !== 'object' || typeof raw.text !== 'string' || raw.text.trim() === '') return null;
    const todo = {
        id: Number.isFinite(raw.id) ? raw.id : now,
        text: raw.text.trim(),
        completed: raw.completed === true,
        priority: PRIORITIES.includes(raw.priority) ? raw.priority : 'normal',
        createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : now,
    };
    if (typeof raw.dueDate === 'string' && DAY_KEY.test(raw.dueDate)) todo.dueDate = raw.dueDate;
    if (todo.completed && Number.isFinite(raw.completedAt)) todo.completedAt = raw.completedAt;
    if (Array.isArray(raw.notes)) {
        const notes = raw.notes.map((n, i) => normalizeNote(n, now + i + 1)).filter(Boolean);
        if (notes.length > 0) todo.notes = notes;
    }
    return todo;
}

// 특정 todo만 바꾸는 공통 패턴
function updateTodo(state, id, update) {
    return state.map(todo => todo.id === id ? update(todo) : todo);
}

export function todoReducer(state, action) {
    switch (action.type) {
        case 'ADD': return [...state, action.todo];
        // action.at: 완료한 시각. 해제하면 지운다 (undefined는 JSON에 안 남는다)
        case 'TOGGLE': return state.map(todo =>
            todo.id === action.id
                ? { ...todo, completed: !todo.completed, completedAt: todo.completed ? undefined : action.at }
                : todo
        );
        // 하나라도 안 끝났으면 전부 완료, 전부 끝났으면 전부 해제
        case 'TOGGLE_ALL': {
            const completed = state.some(todo => !todo.completed);
            return state.map(todo => ({
                ...todo,
                completed,
                completedAt: completed ? (todo.completedAt ?? action.at) : undefined,
            }));
        }
        case 'REMOVE': return state.filter(todo => todo.id !== action.id);
        // 삭제 취소: 원래 있던 자리(index)에 되돌려 넣기
        case 'RESTORE': {
            const next = [...state];
            next.splice(action.index, 0, action.todo);
            return next;
        }
        case 'CLEAR_COMPLETED' : return state.filter(todo => !todo.completed);
        case 'EDIT': return state.map(todo =>
            todo.id === action.id ? { ...todo, text: action.newText } : todo
        );
        case 'SET_PRIORITY': return state.map(todo =>
            todo.id === action.id ? { ...todo, priority: action.priority } : todo
        );
        // dueDate: 'YYYY-MM-DD' 또는 undefined(마감 없음)
        case 'SET_DUE': return state.map(todo =>
            todo.id === action.id ? { ...todo, dueDate: action.dueDate || undefined } : todo
        );
        case 'ADD_NOTE': return updateTodo(state, action.id, todo =>
            ({ ...todo, notes: [...(todo.notes ?? []), action.note] })
        );
        case 'EDIT_NOTE': return updateTodo(state, action.id, todo => ({
            ...todo,
            notes: (todo.notes ?? []).map(n => n.id === action.noteId ? { ...n, text: action.text, category: action.category ?? n.category } : n),
        }));
        case 'REMOVE_NOTE': return updateTodo(state, action.id, todo =>
            ({ ...todo, notes: (todo.notes ?? []).filter(n => n.id !== action.noteId) })
        );
        // 가져오기: 이미 있는 id는 건너뛰고 새 것만 뒤에 붙인다 — 기존 데이터를 잃지 않는다
        case 'IMPORT': {
            const known = new Set(state.map(todo => todo.id));
            return [...state, ...action.todos.filter(todo => !known.has(todo.id))];
        }
        default: return state;
    }
}
