import { useEffect, useRef, useState } from 'react';
import { PRIORITY_LABEL } from '../reducers/todoReducer';
import { addBall, createWorld, DT, isResting, removeBall, resize, step } from '../lib/physics';
import { ballsFromTodos, baseRadius, dropX, dueText, fitLabel, isDoubleTap, readableOn } from '../lib/pile';
import { dayKey } from '../lib/stats';
import { useNow } from '../hooks/useNow';

// 더미 탭: 남은 할 일이 공으로 떨어져 쌓인다. 두 번 누르면 터지면서 끝낸 일이 된다.
// 물리 세계는 ref 안에서 명령형으로 돈다 — 프레임마다 React 를 다시 그리지 않는다.

const DROP_GAP_MS = 80;
const DRAG_START = 6;        // 이만큼 움직여야 끌기, 그 안이면 누르기
const MAX_THROW = 2500;      // 던지는 속도 상한 (px/s)
const SPARKS = 12;
const SPARK_MS = 450;
const MAX_STEPS_PER_FRAME = 5;

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// 스킨 토큰(light-dark(), oklch 등)을 캔버스가 쓸 실제 색으로:
// 숨은 요소에 칠해 계산된 색을 읽고, 1px 캔버스에 찍어 RGB 를 얻는다
function readColors(probe) {
    const pixel = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const read = (token) => {
        probe.style.color = `var(${token})`;
        const css = getComputedStyle(probe).color;
        pixel.clearRect(0, 0, 1, 1);
        pixel.fillStyle = css;
        pixel.fillRect(0, 0, 1, 1);
        const [r, g, b] = pixel.getImageData(0, 0, 1, 1).data;
        return { css, rgb: [r, g, b] };
    };
    const ink = read('--ink');
    const sheet = read('--sheet');
    const ball = { high: read('--chart-1'), normal: read('--chart-2'), low: read('--chart-3') };
    return {
        ball,
        high: read('--high').css,
        accent: read('--accent').css,
        label: Object.fromEntries(Object.entries(ball).map(([key, c]) => [key, readableOn(c.rgb, [ink, sheet]).css])),
        font: getComputedStyle(probe).fontFamily,
    };
}

export default function Pile({ todos, dispatch, onOpenTodo, onToast }) {
    const today = dayKey(useNow());
    const { items, hidden } = ballsFromTodos(todos, today);
    const [selectedId, setSelectedId] = useState(null);
    const stageRef = useRef(null);
    const canvasRef = useRef(null);
    const probeRef = useRef(null);
    const engine = useRef(null);
    const latest = useRef({ items, dispatch, onToast });
    useEffect(() => { latest.current = { items, dispatch, onToast }; });

    // 물리 세계·그리기·포인터: 탭이 열릴 때 한 번 만든다
    useEffect(() => {
        const stage = stageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const reduced = reducedMotion();
        const rect = stage.getBoundingClientRect();
        const world = createWorld({ width: rect.width, height: rect.height });
        let colors = readColors(probeRef.current);
        let dpr = window.devicePixelRatio || 1;
        let running = false;
        let raf = 0;
        let last = 0;
        let acc = 0;
        let queue = [];
        let dropTimer = null;
        let sparks = [];
        let drag = null;
        let lastTap = null;
        let focusId = null;

        const radiusOf = (item) => baseRadius(world.width) * item.scale;

        function spawn(item) {
            const r = radiusOf(item);
            const ball = addBall(world, { id: item.id, x: r + dropX(item.id) * Math.max(0, world.width - 2 * r), y: -r, r });
            ball.item = item;
        }

        function settle() {
            for (let i = 0; i < 3000 && !isResting(world); i++) step(world);
        }

        function pump() {
            if (dropTimer || queue.length === 0) return;
            const tick = () => {
                spawn(queue.shift());
                wake();
                dropTimer = queue.length ? setTimeout(tick, DROP_GAP_MS) : null;
            };
            dropTimer = setTimeout(tick, 0);
        }

        function draw(now) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, world.width, world.height);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const b of world.balls) {
                const p = b.item.priority;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fillStyle = colors.ball[p].css;
                ctx.fill();
                if (b.item.overdue) { ctx.lineWidth = 3; ctx.strokeStyle = colors.high; ctx.stroke(); }
                if (b.id === focusId) {
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2);
                    ctx.lineWidth = 2.5;
                    ctx.strokeStyle = colors.accent;
                    ctx.stroke();
                }
                ctx.font = `${Math.max(10, Math.round(b.r * 0.42))}px ${colors.font}`;
                if (b.labelFor !== b.r) { b.label = fitLabel(b.item.text, b.r * 1.6, (s) => ctx.measureText(s).width); b.labelFor = b.r; }
                ctx.fillStyle = colors.label[p];
                ctx.fillText(b.label, b.x, b.y);
            }
            for (const s of sparks) {
                const t = (now - s.born) / SPARK_MS;
                const sec = (now - s.born) / 1000;
                ctx.globalAlpha = Math.max(0, 1 - t);
                ctx.beginPath();
                ctx.arc(s.x + s.vx * sec, s.y + s.vy * sec, s.r * (1 - t * 0.5), 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        function frame(now) {
            acc += Math.min((now - last) / 1000, MAX_STEPS_PER_FRAME * DT);
            last = now;
            while (acc >= DT) { step(world); acc -= DT; }
            sparks = sparks.filter((s) => now - s.born < SPARK_MS);
            draw(now);
            // 모두 멈추면 쉰다 — 끌거나 새 공이 생기면 wake() 로 다시 돈다
            if (isResting(world) && sparks.length === 0 && !drag && queue.length === 0) { running = false; return; }
            raf = requestAnimationFrame(frame);
        }

        function wake() {
            if (running) return;
            running = true;
            last = performance.now();
            acc = 0;
            raf = requestAnimationFrame(frame);
        }

        function pop(id) {
            const { items: current, dispatch: send, onToast: toast } = latest.current;
            const item = current.find((i) => i.id === id);
            if (!item) return;
            const ball = world.balls.find((b) => b.id === id);
            if (ball && !reduced) {
                const born = performance.now();
                for (let k = 0; k < SPARKS; k++) {
                    const angle = (k / SPARKS) * Math.PI * 2;
                    const speed = 160 + (k % 3) * 80;
                    sparks.push({ x: ball.x, y: ball.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: Math.max(2, ball.r * 0.18), color: colors.ball[item.priority].css, born });
                }
            }
            removeBall(world, id);
            setSelectedId((s) => (s === id ? null : s));
            send({ type: 'TOGGLE', id, at: Date.now() });
            toast({
                text: `끝냈어요: ${item.text}`,
                actionLabel: '되돌리기',
                // 토글이 아니라 지정 — 그 사이 다른 곳에서 바꿨어도 "안 끝낸 일"로 돌아온다
                onAction: () => latest.current.dispatch({ type: 'SET_COMPLETED_MANY', ids: [id], completed: false }),
            });
            wake();
        }

        // 목록이 바뀌면: 사라진 할 일은 조용히 빼고, 새 할 일은 떨어뜨리고, 고친 할 일은 크기·글자를 다시
        function sync(nextItems) {
            const want = new Map(nextItems.map((i) => [i.id, i]));
            for (const b of [...world.balls]) {
                const item = want.get(b.id);
                if (!item) { removeBall(world, b.id); continue; }
                b.item = item;
                b.r = radiusOf(item);
                b.m = b.r * b.r;
                b.labelFor = null;
            }
            queue = queue.filter((i) => want.has(i.id)).map((i) => want.get(i.id));
            const have = new Set([...world.balls.map((b) => b.id), ...queue.map((i) => i.id)]);
            const fresh = nextItems.filter((i) => !have.has(i.id));
            if (reduced) { fresh.forEach(spawn); settle(); } else { queue.push(...fresh); pump(); }
            wake();
        }

        function focus(id) {
            focusId = id;
            wake();
        }

        // 화면 크기 변화 → 캔버스 해상도, 공 크기, 벽
        const resizer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            resize(world, width, height);
            for (const b of world.balls) { b.r = radiusOf(b.item); b.m = b.r * b.r; b.labelFor = null; }
            wake();
        });
        resizer.observe(stage);

        // 스킨·테마가 바뀌면 색을 다시 읽는다
        const recolor = () => { colors = readColors(probeRef.current); for (const b of world.balls) b.labelFor = null; wake(); };
        const watcher = new MutationObserver(recolor);
        watcher.observe(document.documentElement, { attributes: true });
        const scheme = matchMedia('(prefers-color-scheme: dark)');
        scheme.addEventListener('change', recolor);

        // 포인터: 끌어 던지기 · 한 번 누르기(카드) · 두 번 누르기(터뜨리기)
        const at = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
        const ballAt = (p) => [...world.balls].reverse().find((b) => Math.hypot(b.x - p.x, b.y - p.y) <= b.r);
        function onDown(e) {
            const p = at(e);
            const ball = ballAt(p);
            if (!ball) { setSelectedId(null); return; }
            canvas.setPointerCapture(e.pointerId);
            drag = { ball, start: p, moved: false, samples: [{ ...p, t: e.timeStamp }] };
        }
        function onMove(e) {
            if (!drag) return;
            const p = at(e);
            if (!drag.moved && Math.hypot(p.x - drag.start.x, p.y - drag.start.y) > DRAG_START) { drag.moved = true; drag.ball.held = true; }
            if (!drag.moved) return;
            drag.ball.x = p.x;
            drag.ball.y = p.y;
            drag.samples.push({ ...p, t: e.timeStamp });
            if (drag.samples.length > 5) drag.samples.shift();
            wake();
        }
        function onUp(e) {
            if (!drag) return;
            const d = drag;
            drag = null;
            const p = at(e);
            if (d.moved) {
                const first = d.samples[0];
                const lastSample = d.samples[d.samples.length - 1];
                const sec = Math.max((lastSample.t - first.t) / 1000, 1 / 120);
                const clamp = (v) => Math.max(-MAX_THROW, Math.min(MAX_THROW, v));
                d.ball.held = false;
                d.ball.vx = clamp((lastSample.x - first.x) / sec);
                d.ball.vy = clamp((lastSample.y - first.y) / sec);
                world.quiet = 0;
                wake();
                return;
            }
            const tap = { id: d.ball.id, t: e.timeStamp, x: p.x, y: p.y };
            if (isDoubleTap(lastTap, tap)) { lastTap = null; pop(d.ball.id); } else { lastTap = tap; setSelectedId(d.ball.id); }
        }
        function onCancel() {
            if (drag) drag.ball.held = false;
            drag = null;
            wake();
        }
        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onCancel);

        engine.current = { sync, pop, focus };
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(dropTimer);
            resizer.disconnect();
            watcher.disconnect();
            scheme.removeEventListener('change', recolor);
            canvas.removeEventListener('pointerdown', onDown);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerup', onUp);
            canvas.removeEventListener('pointercancel', onCancel);
            engine.current = null;
        };
    }, []);

    // 공에 영향을 주는 것이 바뀔 때만 맞춘다 (items 는 렌더마다 새 배열)
    const itemsKey = items.map((i) => `${i.id}:${i.priority}:${i.overdue}:${i.text}`).join('\n');
    useEffect(() => { engine.current?.sync(latest.current.items); }, [itemsKey]);

    useEffect(() => {
        if (selectedId === null) return;
        const onKey = (e) => { if (e.key === 'Escape') setSelectedId(null); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [selectedId]);

    const selected = items.find((i) => i.id === selectedId);

    return (
        <section className="pile" aria-label="할 일 더미">
            <div className="pile-stage" ref={stageRef}>
                <canvas ref={canvasRef} className="pile-canvas" aria-hidden="true" />
                <span ref={probeRef} className="pile-probe" aria-hidden="true" />
                {items.length === 0 && <p className="todo-empty pile-empty">남은 할 일이 없어요</p>}
                {hidden > 0 && <p className="pile-more">{hidden}개 더</p>}
            </div>
            {selected && (
                <div className="pile-card" role="group" aria-label="고른 할 일">
                    <strong>{selected.text}</strong>
                    <span>{selected.dueDate ? `마감 ${dueText(selected.dueDate, today)}` : '마감 없음'} · 우선순위 {PRIORITY_LABEL[selected.priority]}</span>
                    <button type="button" className="ghost-btn" onClick={() => onOpenTodo(selected.id)}>자세히</button>
                </div>
            )}
            <p className="pile-hint">공을 끌어 던지고, 두 번 누르면 터지면서 끝낸 일이 돼요.</p>
            <ul className="pile-list" aria-label="더미의 할 일">
                {items.map((item) => (
                    <li key={item.id}>
                        <button type="button" className="ghost-btn" onFocus={() => engine.current?.focus(item.id)} onBlur={() => engine.current?.focus(null)}
                            onClick={() => engine.current?.pop(item.id)}>{item.text} 끝내기</button>
                        <button type="button" className="ghost-btn" onFocus={() => engine.current?.focus(item.id)} onBlur={() => engine.current?.focus(null)}
                            onClick={() => onOpenTodo(item.id)}>자세히</button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
