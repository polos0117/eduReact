import { useEffect, useRef, useState } from 'react';
import { PRIORITIES, PRIORITY_LABEL, priorityOf, NOTE_CATEGORIES, NOTE_LABEL } from '../reducers/todoReducer';

// 클립보드 복사 버튼. 눌린 뒤 1.5초간 "복사됨"
function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timer);
    }, [copied]);
    return (
        <button type="button" className="todo-item-btn" onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}>
            {copied ? '복사됨' : '복사'}
        </button>
    );
}

function Note({ note, onEdit, onRemove }) {
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
            <pre className="note-text">{note.text}</pre>
            <div className="note-actions">
                <CopyButton text={note.text} />
                <button type="button" className="todo-item-btn" onClick={() => { setText(note.text); setEditing(true); }}>수정</button>
                <button type="button" className="todo-item-btn" onClick={onRemove}>삭제</button>
            </div>
        </li>
    );
}

// 할 일 하나의 상세 화면. 네이티브 <dialog> — Esc와 배경 클릭으로 닫힌다.
function TodoDetail({ todo, dispatch, onClose }) {
    const ref = useRef(null);
    const [title, setTitle] = useState(todo.text);
    const [draft, setDraft] = useState({ category: 'backend', text: '' });

    useEffect(() => { ref.current.showModal(); }, []);

    function saveTitle() {
        const trimmed = title.trim();
        if (trimmed !== '' && trimmed !== todo.text) dispatch({ type: 'EDIT', id: todo.id, newText: trimmed });
        else setTitle(todo.text);
    }
    function addNote() {
        if (draft.text.trim() === '') return;
        const now = Date.now();
        dispatch({ type: 'ADD_NOTE', id: todo.id, note: { id: now, category: draft.category, text: draft.text, createdAt: now } });
        setDraft(d => ({ ...d, text: '' }));
    }

    const notes = todo.notes ?? [];

    return (
        <dialog ref={ref} className="detail" onClose={onClose}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            aria-labelledby="detail-title">
            <div className="detail-body">
                <header className="detail-head">
                    <input type="checkbox" className="todo-item-checkbox" checked={todo.completed}
                        onChange={() => dispatch({ type: 'TOGGLE', id: todo.id, at: Date.now() })} aria-label="완료" />
                    <input id="detail-title" className="detail-title" value={title} aria-label="제목"
                        onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">×</button>
                </header>

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
                    </label>
                </div>

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
                                                <Note key={note.id} note={note}
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
