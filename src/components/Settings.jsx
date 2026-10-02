import { useEffect, useRef, useState } from 'react';
import { defaultDevice } from '../hooks/useSync';
import { customColor, pickerValue, tagStyle } from '../lib/tags';
import { SKINS, THEMES } from '../hooks/useTheme';

// 단축키 목록 — 동작은 App.jsx 의 keydown 처리에 있다
const SHORTCUTS = [
    [['n'], '새 할 일 칸으로'],
    [['/'], '검색'],
    [['1', '2', '3', '4'], '할 일 · 대시보드 · 캘린더 · 더미 탭'],
    [['j', 'k'], '목록에서 아래 · 위로 (↓ ↑ 도 됨)'],
    [['Enter'], '초점 둔 항목의 상세 열기'],
    [['x'], '초점 둔 항목 완료 / 완료 취소'],
    [['Delete'], '초점 둔 항목 삭제 (취소 가능)'],
    [['r'], '기간 보고서'],
    [['Alt', '↑', '↓'], '직접 정렬에서 초점 둔 항목을 위·아래로'],
    [['?'], '설정 열기'],
];

// 스킨 하나의 미리보기 카드. 미리보기 칸에 data-skin 을 붙여 그 스킨의 토큰으로 그려진다 (CSS 참고)
function SkinCard({ id, label, desc, active, onPick }) {
    return (
        <button type="button" role="radio" aria-checked={active}
            className={`skin-card${active ? ' active' : ''}`} onClick={onPick}>
            <span className="skin-card-canvas" data-skin={id} aria-hidden="true">
                <span className="skin-card-sheet">
                    <span className="skin-card-title">할 일</span>
                    <span className="skin-card-row"><i className="skin-card-dot" /><i className="skin-card-bar high" /></span>
                    <span className="skin-card-row"><i className="skin-card-dot is-done" /><i className="skin-card-bar" /></span>
                </span>
            </span>
            <span className="skin-card-label">{label}</span>
            <span className="skin-card-desc">{desc}</span>
        </button>
    );
}

// 태그 하나의 색 고르기. 고른 적이 없으면 이름에 따라 자동으로 정해진다.
function TagColorRow({ tag, colors, onPick }) {
    const custom = customColor(tag, colors);
    const chip = tagStyle(tag, colors);
    return (
        <li className="tagcolor-row">
            <span {...chip} className={`tag-chip ${chip.className}`}>#{tag}</span>
            <span className="tagcolor-controls">
                <input type="color" className="color-input" value={pickerValue(tag, colors)}
                    aria-label={`${tag} 색 고르기`} title="색 고르기"
                    onChange={(e) => onPick(e.target.value)} />
                <button type="button" className={`tagcolor-auto${custom ? '' : ' active'}`}
                    aria-pressed={!custom} onClick={() => onPick(null)}
                    title="이름에 따라 자동으로 정하기">자동</button>
            </span>
        </li>
    );
}

// 동기화: 비공개 GitHub 저장소 + 그 저장소만 쓸 수 있는 토큰
function SyncSection({ sync, open }) {
    const s = sync.settings;
    const [repo, setRepo] = useState(s?.repo ?? '');
    const [path, setPath] = useState(s?.path ?? 'todos.json');
    const [token, setToken] = useState('');
    const [device, setDevice] = useState(s?.device ?? defaultDevice());
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    async function connect(e) {
        e.preventDefault();
        const cleanRepo = repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
        if (!/^[\w.-]+\/[\w.-]+$/.test(cleanRepo)) { setMessage('저장소는 "소유자/이름" 모양으로 적어 주세요. 예: polos0117/todo-data'); return; }
        if (!token.trim() && !s?.token) { setMessage('토큰을 넣어 주세요.'); return; }
        setBusy(true);
        const error = await sync.connect({ repo: cleanRepo, path: path.trim() || 'todos.json', token: token.trim() || s.token, device: device.trim() || defaultDevice() });
        setBusy(false);
        setToken('');
        setMessage(error ?? '연결했어요. 이제 바뀔 때마다 저장돼요.');
    }

    return (
        <details className="settings-field" id="sync-section" open={open}>
            <summary className="section-title">동기화 (PC·휴대폰)</summary>
            <form className="sync-form" onSubmit={connect}>
                <label className="sync-row">저장소
                    <input className="settings-input" value={repo} onChange={e => setRepo(e.target.value)} placeholder="polos0117/todo-data" autoComplete="off" spellCheck={false} />
                </label>
                <label className="sync-row">파일
                    <input className="settings-input" value={path} onChange={e => setPath(e.target.value)} autoComplete="off" spellCheck={false} />
                </label>
                <label className="sync-row">토큰
                    <input className="settings-input" type="password" value={token} onChange={e => setToken(e.target.value)}
                        placeholder={s?.token ? '저장됨 — 바꿀 때만 입력' : 'github_pat_…'} autoComplete="off" />
                </label>
                <label className="sync-row">기기 이름
                    <input className="settings-input" value={device} onChange={e => setDevice(e.target.value)} autoComplete="off" />
                </label>
                <div className="sync-actions">
                    <button type="submit" className="ghost-btn" disabled={busy}>{busy ? '확인 중…' : s ? '다시 연결' : '연결'}</button>
                    {s && <button type="button" className="ghost-btn" onClick={() => { sync.disconnect(); setMessage('끊었어요. 할 일은 이 기기에 그대로 있어요.'); }}>끊기</button>}
                    {s && <button type="button" className="ghost-btn" onClick={sync.syncNow}>지금 동기화</button>}
                </div>
                <p className="section-note" role="status">{message}</p>
            </form>
            <ol className="section-note sync-help">
                <li>GitHub 에 <b>비공개</b> 저장소를 하나 만듭니다.</li>
                <li><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">토큰 만들기</a> — Repository access 는 그 저장소 하나, Permissions 의 Contents 를 Read and write 로.</li>
                <li>저장소와 토큰을 넣고 [연결]. 휴대폰에서도 같은 저장소로 한 번 더.</li>
            </ol>
            <p className="section-note">토큰은 이 기기의 브라우저에만 저장돼요. 저장할 때마다 저장소에 커밋이 하나씩 남아서, GitHub 에서 예전 상태로 되돌릴 수 있어요.</p>
        </details>
    );
}

// 설정 — 모양(스킨·테마), 태그 색, 커밋 번호 링크 형식. 값은 localStorage(useLocalState)에 있다.
function Settings({ revTemplate, onChangeRevTemplate, allTags, tagColors, onChangeTagColors,
    skin, onChangeSkin, theme, onChangeTheme, sync, focus, onClose }) {
    const ref = useRef(null);
    // StrictMode 는 효과를 두 번 돌린다(정리 → 재실행). 정리의 close() 도 close 이벤트를 내므로
    // <dialog onClose> 를 쓰면 스스로 닫혀 버린다. 사용자가 닫는 경로(Esc)는 cancel 로 받는다.
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog.open) dialog.showModal();
        return () => dialog.close();
    }, []);

    function pick(tag, color) {
        const next = { ...tagColors };
        if (color == null) delete next[tag]; // 자동으로 되돌리기
        else next[tag] = color;
        onChangeTagColors(next);
    }

    useEffect(() => {
        if (focus === 'sync') document.getElementById('sync-section')?.scrollIntoView({ block: 'start' });
    }, [focus]);

    return (
        <dialog ref={ref} className="detail settings" onCancel={onClose}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="settings-title">
            <div className="detail-body">
                <header className="detail-head">
                    <h2 id="settings-title" className="settings-title">설정</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">×</button>
                </header>
                <div className="settings-body">
                    <SyncSection sync={sync} open={focus === 'sync' || !sync.settings} />
                    <details className="settings-field" open>
                        <summary className="section-title">모양</summary>
                        <div className="skin-grid" role="radiogroup" aria-label="스킨">
                            {SKINS.map(([key, label, desc]) => (
                                <SkinCard key={key} id={key} label={label} desc={desc}
                                    active={skin === key} onPick={() => onChangeSkin(key)} />
                            ))}
                        </div>
                        {/* .theme-select: 어두운 톤 전용 스킨이 이 클래스를 숨긴다 (머리글의 드롭다운과 같이) */}
                        <div className="filter-tabs theme-seg theme-select" role="group" aria-label="테마">
                            {THEMES.map(([key, label]) => (
                                <button key={key} type="button" aria-pressed={theme === key}
                                    className={`filter-btn${theme === key ? ' active' : ''}`}
                                    onClick={() => onChangeTheme(key)}>{label}</button>
                            ))}
                        </div>
                    </details>

                    <details className="settings-field" open>
                        <summary className="section-title">태그 색</summary>
                        {allTags.length === 0
                            ? <p className="section-note">태그를 달면 여기에서 색을 고를 수 있어요.</p>
                            : (
                                <>
                                    <ul className="tagcolor-list">
                                        {allTags.map(tag => (
                                            <TagColorRow key={tag} tag={tag} colors={tagColors}
                                                onPick={(c) => pick(tag, c)} />
                                        ))}
                                    </ul>
                                    <p className="section-note">
                                        고르지 않은 태그는 이름에 따라 자동으로 정해집니다. 글자는 늘 잉크색이라 어떤 색을 골라도 읽히지만,
                                        배경과 너무 비슷한 색은 칩이 옅어 보일 수 있습니다.
                                    </p>
                                </>
                            )}
                    </details>

                    <details className="settings-field">
                        <summary className="section-title">단축키</summary>
                        <dl className="shortcut-list">
                            {SHORTCUTS.map(([keys, what]) => (
                                <div key={what}><dt>{keys.map(k => <kbd key={k}>{k}</kbd>)}</dt><dd>{what}</dd></div>
                            ))}
                        </dl>
                        <p className="section-note">글자를 입력하는 중이거나 대화상자가 열려 있을 때는 동작하지 않습니다.</p>
                    </details>

                    <details className="settings-field">
                        <summary className="section-title">커밋 번호 링크 형식</summary>
                        <label>
                            <input type="url" className="settings-input" value={revTemplate} placeholder="https://svn.example.com/rev/{n}"
                                aria-label="커밋 번호 링크 형식" onChange={(e) => onChangeRevTemplate(e.target.value.trim())} />
                        </label>
                        <p className="section-note">
                            노트 안의 <code>r5074</code> 같은 번호가 이 주소로 열립니다. <code>{'{n}'}</code> 자리에 번호가 들어가고,
                            없으면 끝에 붙습니다. 비워 두면 링크로 만들지 않습니다. URL(<code>https://…</code>)은 설정 없이 항상 링크입니다.
                        </p>
                    </details>
                </div>
            </div>
        </dialog>
    );
}

export default Settings;
