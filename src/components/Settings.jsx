import { useEffect, useRef } from 'react';
import { TAG_COLOR_COUNT, TAG_COLOR_LABELS, tagColorIndex } from '../lib/tags';

const SLOTS = Array.from({ length: TAG_COLOR_COUNT }, (_, i) => i);

// 태그 하나의 색 고르기. 고른 적이 없으면 "자동"(이름 해시)이 눌린 상태.
function TagColorRow({ tag, picked, onPick }) {
    const shown = tagColorIndex(tag, picked == null ? undefined : { [tag]: picked });
    return (
        <li className="tagcolor-row">
            <span className={`tag-chip tag-c${shown}`}>#{tag}</span>
            <span className="tagcolor-swatches" role="group" aria-label={`${tag} 색`}>
                {SLOTS.map(i => (
                    <button key={i} type="button" className={`swatch-btn tag-c${i}${picked === i ? ' active' : ''}`}
                        aria-pressed={picked === i} title={TAG_COLOR_LABELS[i]}
                        aria-label={`${tag} 색을 ${TAG_COLOR_LABELS[i]}으로`}
                        onClick={() => onPick(i)} />
                ))}
                <button type="button" className={`tagcolor-auto${picked == null ? ' active' : ''}`}
                    aria-pressed={picked == null} onClick={() => onPick(null)}
                    title="이름에 따라 자동으로 정하기">자동</button>
            </span>
        </li>
    );
}

// 설정 — 커밋 번호 링크 형식, 태그 색. 값은 localStorage(useLocalState)에 있다.
function Settings({ revTemplate, onChangeRevTemplate, allTags, tagColors, onChangeTagColors, onClose }) {
    const ref = useRef(null);
    useEffect(() => {
        const dialog = ref.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);

    function pick(tag, index) {
        const next = { ...tagColors };
        if (index == null) delete next[tag]; // 자동으로 되돌리기
        else next[tag] = index;
        onChangeTagColors(next);
    }

    return (
        <dialog ref={ref} className="detail settings" onClose={onClose}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="settings-title">
            <div className="detail-body">
                <header className="detail-head">
                    <h2 id="settings-title" className="settings-title">설정</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">×</button>
                </header>
                <div className="settings-body">
                    <section className="settings-field">
                        <h3 className="section-title">태그 색</h3>
                        {allTags.length === 0
                            ? <p className="section-note">태그를 달면 여기에서 색을 고를 수 있어요.</p>
                            : (
                                <>
                                    <ul className="tagcolor-list">
                                        {allTags.map(tag => (
                                            <TagColorRow key={tag} tag={tag} picked={tagColors[tag] ?? null}
                                                onPick={(i) => pick(tag, i)} />
                                        ))}
                                    </ul>
                                    <p className="section-note">
                                        색은 네 가지뿐입니다 — 색각 이상에서도 서로 구분되는 한도가 여기까지라서요.
                                        태그가 더 많으면 색이 겹치지만, 이름이 함께 보이므로 구분에는 문제가 없습니다.
                                    </p>
                                </>
                            )}
                    </section>

                    <section className="settings-field">
                        <h3 className="section-title">커밋 번호 링크 형식</h3>
                        <label>
                            <input type="url" className="settings-input" value={revTemplate} placeholder="https://svn.example.com/rev/{n}"
                                aria-label="커밋 번호 링크 형식" onChange={(e) => onChangeRevTemplate(e.target.value.trim())} />
                        </label>
                        <p className="section-note">
                            노트 안의 <code>r5074</code> 같은 번호가 이 주소로 열립니다. <code>{'{n}'}</code> 자리에 번호가 들어가고,
                            없으면 끝에 붙습니다. 비워 두면 링크로 만들지 않습니다. URL(<code>https://…</code>)은 설정 없이 항상 링크입니다.
                        </p>
                    </section>
                </div>
            </div>
        </dialog>
    );
}

export default Settings;
