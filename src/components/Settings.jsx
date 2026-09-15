import { useEffect, useRef } from 'react';

// 설정 — 지금은 커밋 번호 링크 형식 하나. 값은 localStorage(useLocalState)에 있다.
function Settings({ revTemplate, onChangeRevTemplate, onClose }) {
    const ref = useRef(null);
    useEffect(() => {
        const dialog = ref.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);
    return (
        <dialog ref={ref} className="detail settings" onClose={onClose}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="settings-title">
            <div className="detail-body">
                <header className="detail-head">
                    <h2 id="settings-title" className="settings-title">설정</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">×</button>
                </header>
                <div className="settings-body">
                    <label className="settings-field">
                        <span>커밋 번호 링크 형식</span>
                        <input type="url" className="settings-input" value={revTemplate} placeholder="https://svn.example.com/rev/{n}"
                            onChange={(e) => onChangeRevTemplate(e.target.value.trim())} />
                        <span className="section-note">
                            노트 안의 <code>r5074</code> 같은 번호가 이 주소로 열립니다. <code>{'{n}'}</code> 자리에 번호가 들어가고, 없으면 끝에 붙습니다. 비워 두면 링크로 만들지 않습니다.
                        </span>
                    </label>
                    <p className="section-note">URL(<code>https://…</code>)은 설정 없이 항상 링크가 됩니다.</p>
                </div>
            </div>
        </dialog>
    );
}

export default Settings;
