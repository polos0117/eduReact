import { useState } from 'react';
import { PRIORITIES, PRIORITY_LABEL } from '../reducers/todoReducer';
import { completedPerDay, countByPriority, dueBuckets, formatDay, dayKey } from '../lib/stats';

const DAYS = 14;
const WEEK_MS = 7 * 24 * 3600 * 1000;

// 완료율 링. 값이 텍스트로도 나오므로 그림은 보조다.
function Ring({ percent }) {
    const r = 22;
    const c = 2 * Math.PI * r;
    return (
        <svg className="ring" viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
            <circle cx="28" cy="28" r={r} className="ring-track" />
            <circle cx="28" cy="28" r={r} className="ring-value"
                strokeDasharray={`${(c * percent) / 100} ${c}`} transform="rotate(-90 28 28)" />
        </svg>
    );
}

// 최근 14일 완료 막대. 한 계열이라 범례 없음, 최대값과 오늘만 직접 라벨.
function CompletedChart({ rows, todayKey }) {
    const W = 560, H = 120, PAD_B = 22, PAD_T = 14;
    const gap = 6;
    const barW = (W - gap * (rows.length - 1)) / rows.length;
    const max = Math.max(1, ...rows.map(r => r.count));
    const plotH = H - PAD_B - PAD_T;
    const maxIndex = rows.findIndex(r => r.count === max);
    return (
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img"
            aria-label={`최근 ${rows.length}일 동안 하루에 완료한 할 일 개수`}>
            <line x1="0" x2={W} y1={H - PAD_B} y2={H - PAD_B} className="axis" />
            {rows.map((r, i) => {
                const h = r.count === 0 ? 0 : Math.max(3, (r.count / max) * plotH);
                const x = i * (barW + gap);
                const y = H - PAD_B - h;
                const label = r.day === todayKey ? '오늘' : formatDay(r.day, todayKey);
                const showLabel = (i === maxIndex && max > 0) || r.day === todayKey;
                return (
                    <g key={r.day} className="bar-group">
                        <rect x={x} y={PAD_T} width={barW} height={plotH} className="bar-hit" />
                        <rect x={x} y={y} width={barW} height={h} rx="3" className="bar" />
                        {showLabel && r.count > 0 && (
                            <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="bar-label">{r.count}</text>
                        )}
                        {(i === 0 || i === rows.length - 1 || i === Math.floor(rows.length / 2)) && (
                            <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="axis-label">{label}</text>
                        )}
                        <title>{`${label}: ${r.count}개 완료`}</title>
                    </g>
                );
            })}
        </svg>
    );
}

function Dashboard({ todos }) {
    // ponytail: 탭에 들어올 때 한 번 잡는다. 자정을 넘겨 켜 두면 하루 어긋남 — 분 단위 갱신이 필요해지면 interval
    const [now] = useState(() => Date.now());
    const todayKey = dayKey(now);
    const total = todos.length;
    const done = todos.filter(todo => todo.completed).length;
    const left = total - done;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    const weekDone = todos.filter(todo => todo.completed && todo.completedAt && now - todo.completedAt < WEEK_MS).length;
    const active = todos.filter(todo => !todo.completed);
    const byPriority = countByPriority(active);
    const buckets = dueBuckets(todos, now);
    const rows = completedPerDay(todos, DAYS, now);

    const stackTotal = Math.max(1, active.length);

    return (
        <div className="dashboard">
            <div className="stats">
                <div className="stat">
                    <span className="stat-value">{left}</span>
                    <span className="stat-label">남은 할 일</span>
                </div>
                <div className="stat stat-ring">
                    <Ring percent={percent} />
                    <div>
                        <span className="stat-value">{percent}%</span>
                        <span className="stat-label">완료율</span>
                    </div>
                </div>
                <div className="stat">
                    <span className={`stat-value${byPriority.high > 0 ? ' is-high' : ''}`}>{byPriority.high}</span>
                    <span className="stat-label">높음 우선순위</span>
                </div>
                <div className="stat">
                    <span className="stat-value">{weekDone}</span>
                    <span className="stat-label">이번 주 완료</span>
                </div>
            </div>

            <section className="section" aria-labelledby="chart-title">
                <h2 id="chart-title" className="section-title">최근 {DAYS}일 완료</h2>
                {done === 0
                    ? <p className="section-note">완료한 할 일이 생기면 여기에 날짜별로 쌓여요.</p>
                    : <CompletedChart rows={rows} todayKey={todayKey} />}
            </section>

            <section className="section" aria-labelledby="prio-title">
                <h2 id="prio-title" className="section-title">남은 할 일의 우선순위</h2>
                {active.length === 0
                    ? <p className="section-note">남은 할 일이 없어요.</p>
                    : (
                        <>
                            <div className="stack" role="img" aria-label={PRIORITIES.map(p => `${PRIORITY_LABEL[p]} ${byPriority[p]}개`).join(', ')}>
                                {PRIORITIES.map(p => byPriority[p] > 0 && (
                                    <div key={p} className={`stack-seg seg-${p}`} style={{ flexGrow: byPriority[p] }}>
                                        {byPriority[p] / stackTotal >= 0.12 && <span>{byPriority[p]}</span>}
                                    </div>
                                ))}
                            </div>
                            <ul className="legend">
                                {PRIORITIES.map(p => (
                                    <li key={p} className="legend-item">
                                        <span className={`swatch seg-${p}`} aria-hidden="true" />
                                        {PRIORITY_LABEL[p]} <strong>{byPriority[p]}</strong>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
            </section>

            <section className="section" aria-labelledby="due-title">
                <h2 id="due-title" className="section-title">마감</h2>
                <dl className="due-rows">
                    <div className={buckets.overdue > 0 ? 'is-high' : ''}><dt>지난 마감</dt><dd>{buckets.overdue}</dd></div>
                    <div><dt>오늘</dt><dd>{buckets.today}</dd></div>
                    <div><dt>이번 주</dt><dd>{buckets.week}</dd></div>
                    <div><dt>그 이후</dt><dd>{buckets.later}</dd></div>
                    <div><dt>마감 없음</dt><dd>{buckets.none}</dd></div>
                </dl>
            </section>
        </div>
    );
}

export default Dashboard;
