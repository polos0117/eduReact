// 우선순위: 정렬 순서와 라벨을 여기서 한 번만 정의한다
export const PRIORITIES = ['high', 'normal', 'low'];
export const PRIORITY_LABEL = { high: '높음', normal: '보통', low: '낮음' };

// 예전에 저장된 todo에는 priority가 없을 수 있다 → 보통으로 본다
export function priorityOf(todo) {
    return todo.priority ?? 'normal';
}

// 완료한 것은 뒤로, 그 다음 높음 → 보통 → 낮음. 같은 순위끼리는 원래 순서 유지(안정 정렬).
// 완료를 먼저 가르는 이유: 그러지 않으면 완료된 항목의 우선순위를 높음으로 바꿨을 때
// 맨 위로 튀어올라 상태가 바뀐 것처럼 보인다.
export function sortByPriority(todos) {
    return sortTodos(todos, 'priority');
}

// 목록 정렬 기준. 어느 기준이든 완료한 것은 뒤로 간다.
//   priority: 높음 → 보통 → 낮음 (기본)
//   due:      마감 빠른 순, 마감 없는 것은 뒤로
//   recent:   최근에 추가한 것부터
export const SORTS = [['priority', '우선순위'], ['due', '마감일'], ['recent', '최근 추가']];
const SORT_CMP = {
    priority: (a, b) => PRIORITIES.indexOf(priorityOf(a)) - PRIORITIES.indexOf(priorityOf(b)),
    due: (a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'),
    recent: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
};
export function sortTodos(todos, by = 'priority') {
    const cmp = SORT_CMP[by] ?? SORT_CMP.priority;
    return [...todos].sort((a, b) => (a.completed === true) - (b.completed === true) || cmp(a, b));
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
        // 초기 버전은 id가 Date.now()였으므로 createdAt이 없으면 id가 곧 생성 시각
        createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Number.isFinite(raw.id) ? raw.id : now,
    };
    if (typeof raw.dueDate === 'string' && DAY_KEY.test(raw.dueDate)) todo.dueDate = raw.dueDate;
    // 실제 작업 기간. 종료일만 있는 건 기간이 아니라서 버린다
    if (typeof raw.startDate === 'string' && DAY_KEY.test(raw.startDate)) {
        todo.startDate = raw.startDate;
        if (typeof raw.endDate === 'string' && DAY_KEY.test(raw.endDate)) {
            todo.endDate = raw.endDate < raw.startDate ? raw.startDate : raw.endDate;
        }
    }
    if (typeof raw.path === 'string' && raw.path.trim() !== '') todo.path = raw.path.trim();
    if (todo.completed && Number.isFinite(raw.completedAt)) todo.completedAt = raw.completedAt;
    if (Array.isArray(raw.notes)) {
        const notes = raw.notes.map((n, i) => normalizeNote(n, now + i + 1)).filter(Boolean);
        if (notes.length > 0) todo.notes = notes;
    }
    if (Array.isArray(raw.subtasks)) {
        const subtasks = raw.subtasks.map((s, i) => normalizeSubtask(s, now + 500 + i)).filter(Boolean);
        if (subtasks.length > 0) todo.subtasks = subtasks;
    }
    const tags = normalizeTags(raw.tags);
    if (tags.length > 0) todo.tags = tags;
    return todo;
}

// 제목 끝의 "#태그"를 떼어낸다: "우유 사기 #개인 #장보기" → { text: "우유 사기", tags: ["개인","장보기"] }
export function parseTags(raw) {
    const tags = [];
    const text = raw.replace(/(^|\s)#([^\s#]+)/g, (_, __, tag) => { tags.push(tag); return ''; }).trim();
    return { text: text || raw.trim(), tags: normalizeTags(tags) };
}

function normalizeTags(list) {
    if (!Array.isArray(list)) return [];
    return [...new Set(list.filter(t => typeof t === 'string').map(t => t.trim().replace(/^#/, '')).filter(Boolean))];
}

function normalizeSubtask(raw, now) {
    if (!raw || typeof raw !== 'object' || typeof raw.text !== 'string' || raw.text.trim() === '') return null;
    return { id: Number.isFinite(raw.id) ? raw.id : now, text: raw.text.trim(), done: raw.done === true };
}

// 하위 항목 진행: { done, total } — 없으면 total 0
export function subtaskProgress(todo) {
    const list = todo.subtasks ?? [];
    return { done: list.filter(s => s.done).length, total: list.length };
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
        // 일괄: 고른 것들을 한 상태로 맞춘다 (토글이 아니라 지정 — 결과가 예측 가능하다)
        case 'SET_COMPLETED_MANY': {
            const ids = new Set(action.ids);
            return state.map(todo => ids.has(todo.id)
                ? { ...todo, completed: action.completed, completedAt: action.completed ? (todo.completedAt ?? action.at) : undefined }
                : todo);
        }
        case 'SET_PRIORITY_MANY': {
            const ids = new Set(action.ids);
            return state.map(todo => ids.has(todo.id) ? { ...todo, priority: action.priority } : todo);
        }
        case 'REMOVE': return state.filter(todo => todo.id !== action.id);
        case 'REMOVE_MANY': {
            const ids = new Set(action.ids);
            return state.filter(todo => !ids.has(todo.id));
        }
        // 일괄 삭제 취소: 작은 index 부터 끼워 넣어야 뒤 index 가 밀리지 않는다
        case 'RESTORE_MANY': {
            const next = [...state];
            for (const { todo, index } of [...action.entries].sort((a, b) => a.index - b.index)) {
                next.splice(index, 0, todo);
            }
            return next;
        }
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
        // 작업 화면 경로 — 빈 값이면 필드를 지운다
        case 'SET_PATH': return updateTodo(state, action.id, todo =>
            ({ ...todo, path: action.path.trim() || undefined })
        );
        // dueDate: 'YYYY-MM-DD' 또는 undefined(마감 없음)
        case 'SET_DUE': return state.map(todo =>
            todo.id === action.id ? { ...todo, dueDate: action.dueDate || undefined } : todo
        );
        // 실제 작업 기간. 시작일을 비우면 종료일도 같이 지운다 (종료일만 있는 상태는 없다)
        case 'SET_RANGE': return updateTodo(state, action.id, todo => {
            const next = { ...todo, startDate: action.startDate || undefined, endDate: action.endDate || undefined };
            if (!next.startDate) next.endDate = undefined;
            else if (next.endDate && next.endDate < next.startDate) next.endDate = next.startDate;
            return next;
        });
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
        case 'ADD_SUBTASK': return updateTodo(state, action.id, todo =>
            ({ ...todo, subtasks: [...(todo.subtasks ?? []), action.subtask] })
        );
        case 'TOGGLE_SUBTASK': return updateTodo(state, action.id, todo => ({
            ...todo, subtasks: (todo.subtasks ?? []).map(s => s.id === action.subtaskId ? { ...s, done: !s.done } : s),
        }));
        case 'EDIT_SUBTASK': return updateTodo(state, action.id, todo => ({
            ...todo, subtasks: (todo.subtasks ?? []).map(s => s.id === action.subtaskId ? { ...s, text: action.text } : s),
        }));
        case 'REMOVE_SUBTASK': return updateTodo(state, action.id, todo =>
            ({ ...todo, subtasks: (todo.subtasks ?? []).filter(s => s.id !== action.subtaskId) })
        );
        // 태그: 빈 배열이면 필드를 지운다 (JSON에 [] 안 남게)
        case 'SET_TAGS': return updateTodo(state, action.id, todo => {
            const tags = normalizeTags(action.tags);
            return { ...todo, tags: tags.length > 0 ? tags : undefined };
        });
        // 가져오기: 이미 있는 id는 건너뛰고 새 것만 뒤에 붙인다 — 기존 데이터를 잃지 않는다
        case 'IMPORT': {
            const known = new Set(state.map(todo => todo.id));
            return [...state, ...action.todos.filter(todo => !known.has(todo.id))];
        }
        default: return state;
    }
}
