import { useEffect, useRef, useState } from 'react';
import { PRIORITIES, PRIORITY_LABEL, priorityOf, NOTE_CATEGORIES, NOTE_LABEL, subtaskProgress } from '../reducers/todoReducer';
import { linkify, revUrl } from '../lib/linkify';
import { holidayOn } from '../lib/holidays';
import { useTagStyle } from '../hooks/useTagColors';
import DoneButton from './Todo/DoneButton';

// 클립보드 복사 버튼. 결과를 1.5초간 보여준다. (clipboard API는 https/localhost에서만 동작)
function CopyButton({ text }) {
    const [result, setResult] = useState(null); // null | 'ok' | 'fail'
    useEffect(() => {
        if (!result) return;
        const timer = setTimeout(() => setResult(null), 1500);
        return () => clearTimeout(timer);
    }, [result]);
    function copy() {
        if (!navigator.clipboard) { setResult('fail'); return; }
        navigator.clipboard.writeText(text).then(() => setResult('ok'), () => setResult('fail'));
    }
    return (
        <button type="button" className="todo-item-btn" onClick={copy}>
            {result === 'ok' ? '복사됨' : result === 'fail' ? '복사 실패' : '복사'}
        </button>
    );
}

// 노트 본문: URL과 r번호(설정이 있을 때)를 링크로. 나머지는 붙여 넣은 그대로.
function NoteText({ text, revTemplate }) {
    return (
        <pre className="note-text">
            {linkify(text).map((part, i) => {
                if (part.type === 'url') return <a key={i} href={part.value} target="_blank" rel="noreferrer">{part.value}</a>;
                if (part.type === 'rev' && revTemplate) {
                    return <a key={i} href={revUrl(revTemplate, part.value)} target="_blank" rel="noreferrer" title={`커밋 ${part.raw} 열기`}>{part.raw}</a>;
                }
                return part.type === 'rev' ? part.raw : part.value;
            })}
        </pre>
    );
}

function Note({ note, revTemplate, onEdit, onRemove }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(note.text);
    function save() {
        if (text.trim() !== '') onEdit(text);
        setEditing(false);
    }
    if (editing) {
        return (
            <li className="note note-editing">
                <textarea className="note-textarea" value={text} autoFocus rows={Math.min(12, text.split('\n').length + 1)}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') { setText(note.text); setEditing(false); }
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save();
                    }} />
                <div className="note-actions">
                    <button type="button" className="todo-item-btn" onClick={save}>저장</button>
                    <button type="button" className="todo-item-btn" onClick={() => { setText(note.text); setEditing(false); }}>취소</button>
                </div>
            </li>
        );
    }
    return (
        <li className="note">
            <NoteText text={note.text} revTemplate={revTemplate} />
            <div className="note-actions">
                <CopyButton text={note.text} />
                <button type="button" className="todo-item-btn" onClick={() => { setText(note.text); setEditing(true); }}>수정</button>
                <button type="button" className="todo-item-btn" onClick={onRemove}>삭제</button>
            </div>
        </li>
    );
}

// 태그 편집: 칩 + 입력. Enter/쉼표로 추가, 빈 칸에서 Backspace면 마지막 태그 제거
function TagEditor({ tags, onChange }) {
    const tagStyle = useTagStyle();
    const [draft, setDraft] = useState('');
    function commit() {
        const value = draft.trim().replace(/^#/, '');
        if (value) onChange([...tags, value]);
        setDraft('');
    }
    return (
        <span className="tag-editor">
            {tags.map(tag => (
                <span key={tag} {...tagStyle(tag)} className={`tag-chip ${tagStyle(tag).className}`}>
                    #{tag}
                    <button type="button" className="tag-remove" onClick={() => onChange(tags.filter(t => t !== tag))} aria-label={`태그 ${tag} 제거`}>×</button>
                </span>
            ))}
            <input className="tag-input" value={draft} placeholder={tags.length === 0 ? '태그 추가' : ''} aria-label="태그 추가"
                onChange={(e) => setDraft(e.target.value)} onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
                    if (e.key === 'Backspace' && draft === '' && tags.length > 0) onChange(tags.slice(0, -1));
                }} />
        </span>
    );
}

// 할 일 하나의 상세 화면. 네이티브 <dialog> — Esc와 배경 클릭으로 닫힌다.
function TodoDetail({ todo, dispatch, revTemplate, onClose }) {
    const ref = useRef(null);
    const [title, setTitle] = useState(todo.text);
    const [path, setPath] = useState(todo.path ?? '');
    const [draft, setDraft] = useState({ category: 'backend', text: '' });
    const [subDraft, setSubDraft] = useState('');

    // StrictMode 는 효과를 두 번 돌린다(정리 → 재실행). 정리의 close() 도 close 이벤트를 내므로
    // <dialog onClose> 를 쓰면 스스로 닫혀 버린다. 사용자가 닫는 경로(Esc)는 cancel 로 받는다.
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog.open) dialog.showModal();
        return () => dialog.close();
    }, []);

    function saveTitle() {
        const trimmed = title.trim();
        if (trimmed !== '' && trimmed !== todo.text) dispatch({ type: 'EDIT', id: todo.id, newText: trimmed });
        else setTitle(todo.text);
    }
    function savePath() {
        if (path.trim() !== (todo.path ?? '')) dispatch({ type: 'SET_PATH', id: todo.id, path });
    }
    function addNote() {
        if (draft.text.trim() === '') return;
        const now = Date.now();
        dispatch({ type: 'ADD_NOTE', id: todo.id, note: { id: now, category: draft.category, text: draft.text, createdAt: now } });
        setDraft(d => ({ ...d, text: '' }));
    }
    function addSubtask() {
        const text = subDraft.trim();
        if (text === '') return;
        dispatch({ type: 'ADD_SUBTASK', id: todo.id, subtask: { id: Date.now(), text, done: false } });
        setSubDraft('');
    }

    const notes = todo.notes ?? [];
    const subtasks = todo.subtasks ?? [];
    const sub = subtaskProgress(todo);
    const tags = todo.tags ?? [];

    return (
        <dialog ref={ref} className="detail" onCancel={onClose}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            aria-labelledby="detail-title">
            <div className="detail-body">
                <header className="detail-head">
                    <DoneButton completed={todo.completed} label={todo.text}
                        onToggle={() => dispatch({ type: 'TOGGLE', id: todo.id, at: Date.now() })} />
                    <input id="detail-title" className="detail-title" value={title} aria-label="제목"
                        onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">×</button>
                </header>

                {/* 작업 화면 경로 — 보고서에 그대로 붙여 넣는 값이라 복사 버튼을 둔다 */}
                <div className="detail-path">
                    <label htmlFor="detail-path" className="sr-only">작업 화면 경로</label>
                    <input id="detail-path" className="path-input" value={path}
                        placeholder="작업 화면 경로 — 예) IP 담보대출 &gt; MyWork &gt; 대출실행여부 등록"
                        onChange={(e) => setPath(e.target.value)} onBlur={savePath}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                    {todo.path && <CopyButton text={todo.path} />}
                </div>

                <div className="detail-meta">
                    <label>우선순위
                        <select className={`priority-select priority-${priorityOf(todo)}`} value={priorityOf(todo)}
                            onChange={(e) => dispatch({ type: 'SET_PRIORITY', id: todo.id, priority: e.target.value })}>
                            {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
                        </select>
                    </label>
                    <label>마감일
                        <input type="date" className="due-input" value={todo.dueDate ?? ''}
                            onChange={(e) => dispatch({ type: 'SET_DUE', id: todo.id, dueDate: e.target.value })} />
                        {holidayOn(todo.dueDate) && <span className="due-holiday">{holidayOn(todo.dueDate)} (공휴일)</span>}
                    </label>
                    <span className="detail-tags">태그
                        <TagEditor tags={tags} onChange={(next) => dispatch({ type: 'SET_TAGS', id: todo.id, tags: next })} />
                    </span>
                </div>

                <section className="subtasks" aria-label="하위 항목">
                    <h3 className="section-title">
                        하위 항목 {sub.total > 0 && <span className="note-group-count">{sub.done} / {sub.total}</span>}
                    </h3>
                    {subtasks.length > 0 && (
                        <ul className="subtask-list">
                            {subtasks.map(s => (
                                <li key={s.id} className={`subtask${s.done ? ' done' : ''}`}>
                                    <input type="checkbox" className="todo-item-checkbox" checked={s.done}
                                        onChange={() => dispatch({ type: 'TOGGLE_SUBTASK', id: todo.id, subtaskId: s.id })}
                                        aria-label={`${s.text} 완료`} />
                                    <input className="subtask-text" defaultValue={s.text} aria-label="하위 항목 내용"
                                        onBlur={(e) => {
                                            const text = e.target.value.trim();
                                            if (text && text !== s.text) dispatch({ type: 'EDIT_SUBTASK', id: todo.id, subtaskId: s.id, text });
                                            else e.target.value = s.text;
                                        }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                                    <button type="button" className="todo-item-btn" aria-label="하위 항목 삭제"
                                        onClick={() => dispatch({ type: 'REMOVE_SUBTASK', id: todo.id, subtaskId: s.id })}>×</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <form className="subtask-form" onSubmit={(e) => { e.preventDefault(); addSubtask(); }}>
                        <input className="subtask-input" value={subDraft} placeholder="하위 항목을 적고 Enter" aria-label="새 하위 항목"
                            onChange={(e) => setSubDraft(e.target.value)} />
                    </form>
                </section>

                <div className="notes">
                    {NOTE_CATEGORIES.map(cat => {
                        const list = notes.filter(n => n.category === cat);
                        return (
                            <section key={cat} className="note-group" aria-label={NOTE_LABEL[cat]}>
                                <h3 className="section-title">
                                    {NOTE_LABEL[cat]} {list.length > 0 && <span className="note-group-count">{list.length}</span>}
                                </h3>
                                {list.length === 0
                                    ? <p className="section-note">아직 없음</p>
                                    : (
                                        <ul className="note-list">
                                            {list.map(note => (
                                                <Note key={note.id} note={note} revTemplate={revTemplate}
                                                    onEdit={(text) => dispatch({ type: 'EDIT_NOTE', id: todo.id, noteId: note.id, text })}
                                                    onRemove={() => dispatch({ type: 'REMOVE_NOTE', id: todo.id, noteId: note.id })} />
                                            ))}
                                        </ul>
                                    )}
                            </section>
                        );
                    })}
                </div>

                <form className="note-form" onSubmit={(e) => { e.preventDefault(); addNote(); }}>
                    <div className="note-form-row">
                        <select className="priority-select" value={draft.category} aria-label="분류"
                            onChange={(e) => setDraft(d => ({ ...d, category: e.target.value }))}>
                            {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{NOTE_LABEL[c]}</option>)}
                        </select>
                        <span className="section-note">코드·경로·링크를 그대로 붙여 넣어도 됩니다. Ctrl+Enter로 추가</span>
                    </div>
                    <textarea className="note-textarea" rows={4} placeholder="내용" value={draft.text}
                        onChange={(e) => setDraft(d => ({ ...d, text: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote(); }} />
                    <div className="note-form-actions">
                        <button type="submit" className="todo-add-btn" disabled={draft.text.trim() === ''}>노트 추가</button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}
export default TodoDetail;
