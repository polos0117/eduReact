import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '../lib/github';
import { syncOnce } from '../lib/syncEngine';

// 비공개 GitHub 저장소와 할 일을 맞춘다. 설정·기준 목록은 이 기기의 localStorage 에만.
// 언제: 바뀐 뒤 3초 · 60초마다 · 탭이 다시 보일 때 · 인터넷이 다시 연결될 때 · 앱 시작

const SETTINGS_KEY = 'sync';
const TODOS_KEY = 'todos';   // usePersistedReducer 가 쓰는 키
const BASE_KEY = 'sync-base';
const DEBOUNCE_MS = 3000;
const POLL_MS = 60_000;

const readJson = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const writeJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 공간이 꽉 참 — 다음 동기화에서 다시 */ } };

export const defaultDevice = () => (/Mobi|Android|iPhone|iPad/.test(navigator.userAgent) ? '휴대폰' : 'PC');

export function useSync(todos, dispatch, normalize) {
    const [settings, setSettings] = useState(() => readJson(SETTINGS_KEY));
    const [status, setStatus] = useState({ kind: settings ? 'syncing' : 'off' });
    const todosRef = useRef(todos);
    const applied = useRef(null);   // 동기화가 넣은 상태 — 이것 때문에 다시 올리지 않게
    const running = useRef(false);
    const again = useRef(false);
    const generation = useRef(0);   // 연결·끊기 때 올린다 — 그 전에 시작한 동기화의 결과는 버린다
    const runRef = useRef(null);
    useEffect(() => { todosRef.current = todos; });

    const run = useCallback(async () => {
        if (!settings) return;
        if (running.current) { again.current = true; return; }
        running.current = true;
        const mine = generation.current;
        const isCurrent = () => generation.current === mine;
        setStatus({ kind: 'syncing' });
        let snapshot = null;
        const work = () => syncOnce({
            client: createClient(settings),
            device: settings.device,
            normalize,
            isCurrent,
            // 탭들이 기준 목록을 같이 쓰므로, 잠금 안에서 모든 탭이 같이 쓰는 저장본을 읽는다
            getLocal: () => (snapshot = readJson(TODOS_KEY) ?? todosRef.current),
            // 덮어쓰지 않는다 — 그 사이 이 기기에서 바뀐 게 있으면 reducer 가 한 번 더 합친다 (SYNC)
            setLocal: (next) => {
                writeJson(TODOS_KEY, next); // 다음 탭이 잠금을 얻었을 때 바로 보이게
                applied.current = next;
                dispatch({ type: 'SYNC', from: snapshot, to: next });
            },
            getBase: () => readJson(BASE_KEY),
            setBase: (next) => writeJson(BASE_KEY, next),
        });
        try {
            // 탭이 여러 개면 한 번에 하나만 (기준 목록을 같이 쓰니까). 잠금이 없는 브라우저는 그냥
            if (navigator.locks) await navigator.locks.request('todo-sync', work);
            else await work();
            if (isCurrent()) setStatus({ kind: 'ok', at: Date.now() });
        } catch (error) {
            if (error.kind !== 'stale' && isCurrent()) {
                setStatus(error.kind === 'network' || navigator.onLine === false
                    ? { kind: 'offline' }
                    : { kind: 'error', message: error.message ?? '동기화 오류 — 다시 시도해요' });
            }
        } finally {
            running.current = false;
            // 도는 사이 설정이 바뀌었을 수 있다 — 옛 run 이 아니라 지금 run 으로
            if (again.current) { again.current = false; runRef.current?.(); }
        }
    }, [settings, dispatch, normalize]);
    useEffect(() => { runRef.current = run; });

    // 받기: 시작 · 주기 · 다시 보일 때 · 다시 연결될 때
    useEffect(() => {
        if (!settings) return;
        run();
        const timer = setInterval(run, POLL_MS);
        const onVisible = () => { if (document.visibilityState === 'visible') run(); };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('online', run);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('online', run);
        };
    }, [settings, run]);

    // 올리기: 이 기기에서 바뀌면 3초 모았다가 (동기화가 넣은 상태는 빼고)
    useEffect(() => {
        if (!settings || todos === applied.current) return;
        const timer = setTimeout(run, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [todos, settings, run]);

    async function connect(next) {
        try {
            await createClient(next).checkRepo();
        } catch (error) {
            return error.message;
        }
        generation.current++;
        writeJson(SETTINGS_KEY, next);
        try { localStorage.removeItem(BASE_KEY); } catch { /* 없어도 된다 */ } // 새 연결은 첫 연결처럼 — 양쪽을 합친다
        setSettings(next);
        return null;
    }

    function disconnect() {
        generation.current++;
        try { localStorage.removeItem(SETTINGS_KEY); localStorage.removeItem(BASE_KEY); } catch { /* 없어도 된다 */ }
        setSettings(null);
        setStatus({ kind: 'off' });
    }

    return { settings, status, connect, disconnect, syncNow: run };
}
