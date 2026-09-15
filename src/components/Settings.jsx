import { useEffect, useRef } from 'react';
import { customColor, pickerValue, tagStyle } from '../lib/tags';
import { SKINS, THEMES } from '../hooks/useTheme';

// 단축키 목록 — 동작은 App.jsx 의 keydown 처리에 있다
const SHORTCUTS = [
    [['n'], '새 할 일 칸으로'],
    [['/'], '검색'],
    [['1', '2', '3'], '할 일 · 대시보드 · 캘린더 탭'],
    [['j', 'k'], '목록에서 아래 · 위로 (↓ ↑ 도 됨)'],
    [['Enter'], '초점 둔 항목의 상세 열기'],
    [['x'], '초점 둔 항목 완료 / 완료 취소'],
    [['Delete'], '초점 둔 항목 삭제 (취소 가능)'],
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

// 설정 — 모양(스킨·테마), 태그 색, 커밋 번호 링크 형식. 값은 localStorage(useLocalState)에 있다.
function Settings({ revTemplate, onChangeRevTemplate, allTags, tagColors, onChangeTagColors,
    skin, onChangeSkin, theme, onChangeTheme, onClose }) {
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

    return (
        <dialog ref={ref} className="detail settings" onCancel={onClose}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="settings-title">
            <div className="detail-body">
                <header className="detail-head">
                    <h2 id="settings-title" className="settings-title">설정</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">×</button>
                </header>
                <div className="settings-body">
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
