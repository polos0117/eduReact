import { useEffect, useRef, useState } from 'react';
import { buildReport } from '../lib/report';
import { dayKey, monthOf, weekOf } from '../lib/stats';
import { useNow } from '../hooks/useNow';

// 기간 프리셋. 직접 고르면 아래 날짜 칸을 쓴다
const PRESETS = [
    ['week', '이번 주', (today) => weekOf(today)],
    ['lastWeek', '지난 주', (today) => weekOf(today, -1)],
    ['month', '이번 달', (today) => monthOf(today)],
    ['lastMonth', '지난 달', (today) => monthOf(today, -1)],
    ['custom', '직접', null],
];

// 기간 보고서 — 끝낸 일 / 진행 중 / 마감 예정을 Markdown 으로. 복사하거나 .md 로 저장한다.
function Report({ todos, onClose, onToast }) {
    const ref = useRef(null);
    const todayKey = dayKey(useNow());
    const [preset, setPreset] = useState('week');
    const [custom, setCustom] = useState(() => weekOf(todayKey));
    const [withNotes, setWithNotes] = useState(true);
    const [withSubtasks, setWithSubtasks] = useState(true);

    // StrictMode 의 이중 효과 때문에 onClose 대신 onCancel 을 쓴다 (TodoDetail 참고)
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog.open) dialog.showModal();
        return () => dialog.close();
    }, []);

    const range = preset === 'custom' ? custom : PRESETS.find(([key]) => key === preset)[2](todayKey);
    const valid = range.from && range.to && range.from <= range.to;
    const markdown = valid ? buildReport(todos, range, todayKey, { notes: withNotes, subtasks: withSubtasks }) : '';

    async function copy() {
        try {
            await navigator.clipboard.writeText(markdown);
            onToast('보고서를 복사했어요');
        } catch {
            onToast('복사하지 못했어요 — 본문을 직접 선택해 복사하세요');
        }
    }
    function download() {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `작업보고-${range.from}~${range.to}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <dialog ref={ref} className="detail report" onCancel={onClose}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="report-title">
            <div className="detail-body">
                <header className="detail-head">
                    <h2 id="report-title" className="settings-title">기간 보고서</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">×</button>
                </header>
                <div className="report-controls">
                    <div className="filter-tabs" role="group" aria-label="기간">
                        {PRESETS.map(([key, label]) => (
                            <button key={key} type="button" aria-pressed={preset === key}
                                className={`filter-btn${preset === key ? ' active' : ''}`}
                                onClick={() => { setPreset(key); if (key === 'custom') setCustom(range); }}>{label}</button>
                        ))}
                    </div>
                    <div className="report-range">
                        <input type="date" className="due-input" value={range.from} aria-label="시작" disabled={preset !== 'custom'}
                            onChange={(e) => setCustom(r => ({ ...r, from: e.target.value }))} />
                        <span className="range-dash" aria-hidden="true">~</span>
                        <input type="date" className="due-input" value={range.to} aria-label="끝" disabled={preset !== 'custom'}
                            min={range.from || undefined}
                            onChange={(e) => setCustom(r => ({ ...r, to: e.target.value }))} />
                    </div>
                    <div className="report-options">
                        <label><input type="checkbox" checked={withNotes} onChange={(e) => setWithNotes(e.target.checked)} /> 노트 포함</label>
                        <label><input type="checkbox" checked={withSubtasks} onChange={(e) => setWithSubtasks(e.target.checked)} /> 하위 항목 포함</label>
                    </div>
                </div>
                <textarea className="report-text" value={markdown} readOnly aria-label="보고서 본문"
                    placeholder="기간을 고르면 여기에 보고서가 만들어져요" />
                <div className="report-actions">
                    <span className="section-note">끝낸 일은 완료한 날, 진행 중은 실제 기간, 마감 예정은 마감일 기준입니다.</span>
                    <button type="button" className="bulk-btn" onClick={download} disabled={!valid}>.md 저장</button>
                    <button type="button" className="bulk-btn primary" onClick={copy} disabled={!valid}>복사</button>
                </div>
            </div>
        </dialog>
    );
}

export default Report;
