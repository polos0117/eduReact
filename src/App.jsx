import { useEffect, useRef, useState } from 'react';
import { todoReducer, normalizeTodo } from './reducers/todoReducer';
import { usePersistedReducer } from './hooks/usePersistedReducer';
import { useTheme, useSkin } from './hooks/useTheme';
import { useNow } from './hooks/useNow';
import { dayKey } from './lib/stats';
import TodoPage from './components/Todo/TodoPage';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import TodoDetail from './components/TodoDetail';
import Settings from './components/Settings';
import { useLocalState } from './hooks/useLocalState';
import './App.css';
import './skin-neo.css';

const TABS = [['todos', '할 일'], ['dashboard', '대시보드'], ['calendar', '캘린더']];
const THEME_LABEL = { system: '시스템', light: '라이트', dark: '다크' };
const THEME_ICON = { system: '◐', light: '☀', dark: '☾' };
const SKIN_LABEL = { classic: '클래식', neo: '네오' };
const DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

// localStorage에서 읽은 값은 믿지 않는다 — 가져오기와 같은 검증을 거친다
function sanitizeTodos(raw) {
    if (!Array.isArray(raw)) return [];
    const now = Date.now();
    return raw.map((todo, i) => normalizeTodo(todo, now + i)).filter(Boolean);
}

// 탭과 목록 조건은 URL 해시로: #todos?filter=active&due=overdue
// 새로고침·뒤로가기·북마크가 그냥 된다 (라우터 불필요)
function readHash() {
    const [path, query = ''] = location.hash.slice(1).split('?');
    const tab = TABS.some(([key]) => key === path) ? path : 'todos';
    return { tab, params: new URLSearchParams(query), hash: location.hash };
}
function useHash() {
    const [state, setState] = useState(readHash);
    useEffect(() => {
        const onChange = () => setState(readHash());
        window.addEventListener('hashchange', onChange);
        return () => window.removeEventListener('hashchange', onChange);
    }, []);
    return state;
}

function App() {
    const [todos, dispatch] = usePersistedReducer(todoReducer, 'todos', [], sanitizeTodos);
    const today = DATE_FORMAT.format(useNow());
    const [theme, cycleTheme] = useTheme();
    const [skin, cycleSkin] = useSkin();
    const { tab, params, hash } = useHash();
    const [toast, setToast] = useState(null); // { text, actionLabel?, onAction? }
    const [detailId, setDetailId] = useState(null); // 상세 화면에 열린 todo
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [revTemplate, setRevTemplate] = useLocalState('revUrl', ''); // 노트의 r번호 → 커밋 링크 형식
    const fileRef = useRef(null);
    const detailTodo = todos.find(todo => todo.id === detailId); // 삭제되면 자연히 닫힌다

    // 토스트는 6초 뒤 사라진다. 새 토스트가 오면 타이머를 새로 건다.
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 6000);
        return () => clearTimeout(timer);
    }, [toast]);

    function removeTodo(id) {
        const index = todos.findIndex(todo => todo.id === id);
        const todo = todos[index];
        dispatch({ type: 'REMOVE', id });
        setToast({
            text: `“${todo.text}” 삭제됨`,
            actionLabel: '되돌리기',
            onAction: () => dispatch({ type: 'RESTORE', todo, index }),
        });
    }

    function exportJson() {
        const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `할일-${dayKey(Date.now())}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function importJson(file) {
        try {
            const data = JSON.parse(await file.text());
            const list = Array.isArray(data) ? data : data?.todos;
            if (!Array.isArray(list)) throw new Error('not a list');
            const now = Date.now();
            const incoming = list.map((raw, i) => normalizeTodo(raw, now + i)).filter(Boolean);
            const known = new Set(todos.map(todo => todo.id));
            const added = incoming.filter(todo => !known.has(todo.id)).length;
            dispatch({ type: 'IMPORT', todos: incoming });
            setToast({ text: added === 0 ? '새로 가져올 할 일이 없어요' : `${added}개 가져왔어요` });
        } catch {
            setToast({ text: 'JSON 파일을 읽지 못했어요. 내보내기로 만든 파일인지 확인하세요.' });
        }
    }

    const leftCount = todos.filter(todo => !todo.completed).length;
    const summary = todos.length === 0 ? '아직 비어 있어요' : leftCount === 0 ? '모두 끝냈어요' : `${leftCount}개 남았어요`;

    return (
        <div className="app">
            <header className="app-header">
                <div className="brand">
                    <h1>할 일</h1>
                    <p className="subline" aria-live="polite">{today}, {summary}</p>
                </div>
                <div className="header-actions">
                    <button type="button" className="ghost-btn" onClick={exportJson} disabled={todos.length === 0}>내보내기</button>
                    <button type="button" className="ghost-btn" onClick={() => fileRef.current.click()}>가져오기</button>
                    <input ref={fileRef} type="file" accept="application/json,.json" hidden
                        onChange={(e) => { const f = e.target.files[0]; if (f) importJson(f); e.target.value = ''; }} />
                    <button type="button" className="ghost-btn" onClick={() => setSettingsOpen(true)}>설정</button>
                    <button type="button" className="skin-btn" onClick={cycleSkin}
                        title={`스킨: ${SKIN_LABEL[skin]} (눌러서 바꾸기)`}
                        aria-label={`스킨: ${SKIN_LABEL[skin]}, 눌러서 바꾸기`}>
                        <span aria-hidden="true">◈</span> {SKIN_LABEL[skin]}
                    </button>
                    <button type="button" className="theme-btn" onClick={cycleTheme}
                        title={`테마: ${THEME_LABEL[theme]} (눌러서 바꾸기)`}
                        aria-label={`테마: ${THEME_LABEL[theme]}, 눌러서 바꾸기`}>
                        <span aria-hidden="true">{THEME_ICON[theme]}</span>
                    </button>
                </div>
            </header>

            <nav className="tabs" aria-label="화면">
                {TABS.map(([key, label]) => (
                    <a key={key} href={`#${key}`} className={`tab${tab === key ? ' active' : ''}`}
                        aria-current={tab === key ? 'page' : undefined}>{label}</a>
                ))}
            </nav>

            <main className="sheet">
                {/* key=hash: 조건이 바뀌면 목록 페이지를 새로 그려 필터 상태를 해시에서 다시 읽는다 */}
                {tab === 'todos' && <TodoPage key={hash} todos={todos} dispatch={dispatch} params={params}
                    onRemoveTodo={removeTodo} onOpenTodo={setDetailId} />}
                {tab === 'dashboard' && <Dashboard todos={todos} params={params} />}
                {tab === 'calendar' && <Calendar todos={todos} dispatch={dispatch} onOpenTodo={setDetailId} />}
            </main>

            {detailTodo && <TodoDetail todo={detailTodo} dispatch={dispatch} revTemplate={revTemplate} onClose={() => setDetailId(null)} />}
            {settingsOpen && <Settings revTemplate={revTemplate} onChangeRevTemplate={setRevTemplate} onClose={() => setSettingsOpen(false)} />}

            {toast && (
                <div className="toast" role="status">
                    <span>{toast.text}</span>
                    {toast.actionLabel && (
                        <button type="button" onClick={() => { toast.onAction(); setToast(null); }}>{toast.actionLabel}</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
