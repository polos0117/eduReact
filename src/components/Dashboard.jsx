import { PRIORITIES, PRIORITY_LABEL } from '../reducers/todoReducer';
import { completedPerDay, countByPriority, countByTag, dueBuckets, formatDay, dayKey, DUE_BUCKETS, periodStats } from '../lib/stats';
import { useNow } from '../hooks/useNow';
import { useTagStyle } from '../hooks/useTagColors';
import ColorByToggle from './ColorByToggle';

const DAYS = 14;
const WEEK_MS = 7 * 24 * 3600 * 1000;
const DUE_SHORT = { overdue: '지난 마감', today: '오늘', week: '이번 주', later: '그 이후', none: '마감 없음' };

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

// 최근 14일 완료 막대. 한 계열이라 범례 없음, 최대값과 오늘만 직접 라벨. 막대를 누르면 그날 완료 목록.
function CompletedChart({ rows, todayKey, listHref }) {
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
                const bar = (
                    <g className="bar-group">
                        <rect x={x} y={PAD_T} width={barW} height={plotH} className="bar-hit" />
                        <rect x={x} y={y} width={barW} height={h} rx="3" className="bar" />
                        {showLabel && r.count > 0 && (
                            <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="bar-label">{r.count}</text>
                        )}
                        {(i === 0 || i === rows.length - 1 || i === Math.floor(rows.length / 2)) && (
                            <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="axis-label">{label}</text>
                        )}
                        <title>{`${label}: ${r.count}개 완료${r.count > 0 ? ' — 눌러서 목록 보기' : ''}`}</title>
                    </g>
                );
                return r.count > 0
                    ? <a key={r.day} href={listHref({ filter: 'completed', done: r.day })} aria-label={`${label} 완료 ${r.count}개 목록`}>{bar}</a>
                    : <g key={r.day}>{bar}</g>;
            })}
        </svg>
    );
}

// params: 해시 쿼리 — tag=x 면 그 태그의 할 일만 집계하고, 목록 링크에도 태그를 실어 보낸다
function Dashboard({ todos: allTodos, params, colorBy, onColorByChange }) {
    const tagStyle = useTagStyle();
    const now = useNow();
    const todayKey = dayKey(now);
    const tag = params.get('tag');
    const allTags = [...new Set(allTodos.flatMap(todo => todo.tags ?? []))].sort();
    const todos = tag ? allTodos.filter(todo => todo.tags?.includes(tag)) : allTodos;

    // 목록 탭으로 가는 링크. 조건은 해시 쿼리로 (TodoPage가 읽는다)
    const listHref = (query) => `#todos?${new URLSearchParams(tag ? { ...query, tag } : query)}`;

    const total = todos.length;
    const done = todos.filter(todo => todo.completed).length;
    const left = total - done;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    const weekDone = todos.filter(todo => todo.completed && todo.completedAt && now - todo.completedAt < WEEK_MS).length;
    const active = todos.filter(todo => !todo.completed);
    const byPriority = countByPriority(active);
    const buckets = dueBuckets(todos, now);
    const rows = completedPerDay(todos, DAYS, now);

    const period = periodStats(todos, todayKey);
    const hasPeriod = period.ongoing + period.started + period.ended + period.samples > 0;
    const stackTotal = Math.max(1, active.length);
    const tagRows = countByTag(active);

    return (
        <div className="dashboard">
            {allTags.length > 0 && (
                <nav className="tag-row" aria-label="태그별 보기">
                    <a href="#dashboard" className={`tag-chip${tag ? '' : ' active'}`}>전체</a>
                    {allTags.map(t => (
                        <a key={t} href={`#dashboard?tag=${encodeURIComponent(t)}`} {...tagStyle(t)}
                            className={`tag-chip ${tagStyle(t).className}${tag === t ? ' active' : ''}`}>#{t}</a>
                    ))}
                </nav>
            )}

            <div className="stats">
                <a className="stat" href={listHref({ filter: 'active' })}>
                    <span className="stat-value">{left}</span>
                    <span className="stat-label">남은 할 일</span>
                </a>
                <a className="stat stat-ring" href={listHref({ filter: 'completed' })}>
                    <Ring percent={percent} />
                    <div>
                        <span className="stat-value">{percent}%</span>
                        <span className="stat-label">완료율</span>
                    </div>
                </a>
                <a className="stat" href={listHref({ filter: 'active', priority: 'high' })}>
                    <span className={`stat-value${byPriority.high > 0 ? ' is-high' : ''}`}>{byPriority.high}</span>
                    <span className="stat-label">높음 우선순위</span>
                </a>
                <a className="stat" href={listHref({ filter: 'completed', done: '7d' })}>
                    <span className="stat-value">{weekDone}</span>
                    <span className="stat-label">최근 7일 완료</span>
                </a>
            </div>

            <section className="section" aria-labelledby="chart-title">
                <h2 id="chart-title" className="section-title">최근 {DAYS}일 완료</h2>
                {done === 0
                    ? <p className="section-note">완료한 할 일이 생기면 여기에 날짜별로 쌓여요.</p>
                    : <CompletedChart rows={rows} todayKey={todayKey} listHref={listHref} />}
            </section>

            <section className="section" aria-labelledby="prio-title">
                <div className="section-head">
                    <h2 id="prio-title" className="section-title">
                        남은 할 일의 {colorBy === 'tag' ? '태그' : '우선순위'}
                    </h2>
                    <ColorByToggle value={colorBy} onChange={onColorByChange} />
                </div>
                {active.length === 0 ? <p className="section-note">남은 할 일이 없어요.</p>
                    : colorBy === 'tag' ? (
                        <>
                            <div className="stack" role="img"
                                aria-label={tagRows.map(r => `${r.tag ?? '태그 없음'} ${r.count}개`).join(', ')}>
                                {tagRows.map(r => (
                                    <a key={r.tag ?? '__none'} style={{ flexGrow: r.count, ...(r.tag ? tagStyle(r.tag).style : null) }}
                                        className={`stack-seg ${r.tag ? `seg-tag ${tagStyle(r.tag).className}` : 'seg-untagged'}`}
                                        href={r.tag ? listHref({ filter: 'active', tag: r.tag }) : listHref({ filter: 'active' })}
                                        title={`${r.tag ?? '태그 없음'} ${r.count}개 — 목록 보기`} />
                                ))}
                            </div>
                            <ul className="legend">
                                {tagRows.map(r => (
                                    <li key={r.tag ?? '__none'} className="legend-item">
                                        <a href={r.tag ? listHref({ filter: 'active', tag: r.tag }) : listHref({ filter: 'active' })}>
                                            <span aria-hidden="true" style={r.tag ? tagStyle(r.tag).style : undefined}
                                                className={`swatch ${r.tag ? `seg-tag ${tagStyle(r.tag).className}` : 'seg-untagged'}`} />
                                            {r.tag ? `#${r.tag}` : '태그 없음'} <strong>{r.count}</strong>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <>
                            <div className="stack" role="img" aria-label={PRIORITIES.map(p => `${PRIORITY_LABEL[p]} ${byPriority[p]}개`).join(', ')}>
                                {PRIORITIES.map(p => byPriority[p] > 0 && (
                                    <a key={p} className={`stack-seg seg-${p}`} style={{ flexGrow: byPriority[p] }}
                                        href={listHref({ filter: 'active', priority: p })} title={`${PRIORITY_LABEL[p]} ${byPriority[p]}개 — 목록 보기`}>
                                        {byPriority[p] / stackTotal >= 0.12 && <span>{byPriority[p]}</span>}
                                    </a>
                                ))}
                            </div>
                            <ul className="legend">
                                {PRIORITIES.map(p => (
                                    <li key={p} className="legend-item">
                                        <a href={listHref({ filter: 'active', priority: p })}>
                                            <span className={`swatch seg-${p}`} aria-hidden="true" />
                                            {PRIORITY_LABEL[p]} <strong>{byPriority[p]}</strong>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
            </section>

            <section className="section" aria-labelledby="due-title">
                <h2 id="due-title" className="section-title">마감</h2>
                <div className="due-rows">
                    {DUE_BUCKETS.map(b => (
                        <a key={b} className={b === 'overdue' && buckets[b] > 0 ? 'is-high' : ''}
                            href={listHref({ filter: 'active', due: b })}>
                            <span className="due-k">{DUE_SHORT[b]}</span>
                            <span className="due-v">{buckets[b]}</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* 실제 시작~종료 기준. 타일마다 같은 조건의 목록으로 이어진다 (periodStats 와 TodoPage 가 같은 weekOf/rangeOf 를 쓴다) */}
            <section className="section" aria-labelledby="period-title">
                <h2 id="period-title" className="section-title">작업 기간</h2>
                {!hasPeriod
                    ? <p className="section-note">상세 화면에서 시작일·종료일을 넣으면 여기에 모여요.</p>
                    : (
                        <div className="due-rows period-rows">
                            <a href={listHref({ filter: 'active', range: todayKey })} title="오늘 진행 중인 항목 목록">
                                <span className="due-k">진행 중</span>
                                <span className="due-v">{period.ongoing}</span>
                            </a>
                            <a href={listHref({ started: 'week' })} title="이번 주에 시작한 항목 목록">
                                <span className="due-k">이번 주 시작</span>
                                <span className="due-v">{period.started}</span>
                            </a>
                            <a href={listHref({ ended: 'week' })} title="이번 주에 끝난 항목 목록">
                                <span className="due-k">이번 주 끝남</span>
                                <span className="due-v">{period.ended}</span>
                            </a>
                            <a href={listHref({ filter: 'completed', range: 'any' })} title="기간을 적은 끝낸 항목 목록 — 평균의 근거">
                                <span className="due-k">평균 소요</span>
                                <span className="due-v">{period.avgDays == null ? '–' : `${period.avgDays}일`}</span>
                                <span className="due-sub">{period.samples > 0 ? `끝낸 ${period.samples}건 기준` : '끝낸 것이 아직 없음'}</span>
                            </a>
                        </div>
                    )}
            </section>
        </div>
    );
}

export default Dashboard;
