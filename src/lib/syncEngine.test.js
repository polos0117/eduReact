import { describe, expect, it } from 'vitest';
import { SyncError } from './github';
import { statusText, syncOnce } from './syncEngine';

const T = (id, extra = {}) => ({ id, text: `할 일 ${id}`, completed: false, createdAt: id, ...extra });

// 가짜 원격 + 이 기기 상태
function setup({ remote = null, local = [], base = null, conflicts = 0 } = {}) {
    const state = { remote, sha: remote ? 's1' : null, local, base, writes: [], conflicts };
    const client = {
        read: async () => ({ todos: state.remote, sha: state.sha }),
        write: async (todos, sha, message) => {
            if (state.conflicts > 0) { state.conflicts--; state.remote = [...(state.remote ?? []), T(99 - state.conflicts)]; state.sha = `${state.sha}x`; throw new SyncError('conflict', 'x'); }
            if (sha !== state.sha) throw new Error(`sha mismatch ${sha} vs ${state.sha}`);
            state.writes.push({ todos, message });
            state.remote = todos;
            state.sha = `${state.sha ?? 's'}+`;
            return state.sha;
        },
    };
    const deps = {
        client, device: 'PC', normalize: (list) => list,
        getLocal: () => state.local, setLocal: (t) => { state.local = t; },
        getBase: () => state.base, setBase: (t) => { state.base = t; },
    };
    return { state, deps };
}

describe('syncOnce', () => {
    it('첫 연결, 원격 파일 없음 → 이 기기 할 일로 만든다', async () => {
        const { state, deps } = setup({ local: [T(1)] });
        expect(await syncOnce(deps)).toEqual({ pushed: true });
        expect(state.writes).toEqual([{ todos: [T(1)], message: '할 일 동기화 (PC)' }]);
        expect(state.base).toEqual([T(1)]);
    });
    it('다른 기기 변경만 → 이 기기 상태를 바꾸고 올리지 않는다', async () => {
        const { state, deps } = setup({ remote: [T(1, { completed: true })], local: [T(1)], base: [T(1)] });
        expect(await syncOnce(deps)).toEqual({ pushed: false });
        expect(state.local).toEqual([T(1, { completed: true })]);
        expect(state.writes).toHaveLength(0);
        expect(state.base).toEqual([T(1, { completed: true })]);
    });
    it('이 기기 변경 → 올린다', async () => {
        const { state, deps } = setup({ remote: [T(1)], local: [T(1), T(2)], base: [T(1)] });
        expect(await syncOnce(deps)).toEqual({ pushed: true });
        expect(state.remote).toEqual([T(1), T(2)]);
    });
    it('그새 다른 기기가 올렸으면(충돌) 다시 받아 합쳐서 올린다', async () => {
        const { state, deps } = setup({ remote: [T(1)], local: [T(1), T(2)], base: [T(1)], conflicts: 1 });
        expect(await syncOnce(deps)).toEqual({ pushed: true });
        expect(state.remote.map(t => t.id).sort((a, b) => a - b)).toEqual([1, 2, 99]);
    });
    it('충돌이 3번 이어지면 오류', async () => {
        const { deps } = setup({ remote: [T(1)], local: [T(1), T(2)], base: [T(1)], conflicts: 5 });
        await expect(syncOnce(deps)).rejects.toMatchObject({ kind: 'conflict' });
    });
    it('원격 파일이 깨졌으면 덮어쓰지 않는다', async () => {
        const { state, deps } = setup({ local: [T(1)] });
        deps.client.read = async () => { throw new SyncError('bad', '저장소 파일을 읽지 못했어요'); };
        await expect(syncOnce(deps)).rejects.toMatchObject({ kind: 'bad' });
        expect(state.writes).toHaveLength(0);
    });
    it('받은 할 일은 normalize 를 거친다', async () => {
        const { state, deps } = setup({ remote: [{ id: 1, text: '  가  ' }], base: [] });
        deps.normalize = (list) => list.map(t => ({ ...t, text: t.text.trim() }));
        await syncOnce(deps);
        expect(state.local).toEqual([{ id: 1, text: '가' }]);
    });
});

describe('syncOnce — 데이터를 잃지 않게', () => {
    it('기준이 있는데 원격 파일이 사라졌으면(누가 지움) 이 기기 할 일은 그대로, 파일을 다시 만든다', async () => {
        const { state, deps } = setup({ local: [T(1), T(2)], base: [T(1), T(2)] });
        await syncOnce(deps);
        expect(state.local).toEqual([T(1), T(2)]);
        expect(state.remote).toEqual([T(1), T(2)]);
    });
    it('모양만 다른 기준(정규화 전 빈 배열)이 다른 기기의 완료를 덮지 않는다', async () => {
        const strip = (list) => list.map(({ notes, ...t }) => (notes?.length ? { ...t, notes } : t));
        const { state, deps } = setup({ remote: [T(1, { completed: true })], local: [T(1)], base: [T(1, { notes: [] })] });
        deps.normalize = strip;
        await syncOnce(deps);
        expect(state.local).toEqual([T(1, { completed: true })]);
    });
    it('같은 번호의 할 일이 있으면 아무것도 바꾸지 않고 멈춘다', async () => {
        const { state, deps } = setup({ remote: [T(1)], local: [T(1), T(1, { text: '겹침' })], base: [T(1)] });
        await expect(syncOnce(deps)).rejects.toMatchObject({ kind: 'bad' });
        expect(state.writes).toHaveLength(0);
        expect(state.local).toEqual([T(1), T(1, { text: '겹침' })]);
    });
    it('도는 중에 연결이 바뀌면(isCurrent false) 아무것도 쓰지 않는다', async () => {
        const { state, deps } = setup({ remote: [T(1, { completed: true })], local: [T(1), T(2)], base: [T(1)] });
        let current = true;
        const read = deps.client.read;
        deps.client.read = async () => { const r = await read(); current = false; return r; };
        deps.isCurrent = () => current;
        await expect(syncOnce(deps)).rejects.toMatchObject({ kind: 'stale' });
        expect(state.writes).toHaveLength(0);
        expect(state.local).toEqual([T(1), T(2)]);
        expect(state.base).toEqual([T(1)]);
    });
});

describe('statusText', () => {
    const now = 1_000_000_000;
    it.each([
        [{ kind: 'off' }, ''],
        [{ kind: 'syncing' }, '동기화 중…'],
        [{ kind: 'ok', at: now - 10_000 }, '동기화됨 · 방금'],
        [{ kind: 'ok', at: now - 5 * 60_000 }, '동기화됨 · 5분 전'],
        [{ kind: 'ok', at: now - 3 * 3_600_000 }, '동기화됨 · 3시간 전'],
        [{ kind: 'offline' }, '오프라인 — 연결되면 올려요'],
        [{ kind: 'error', message: '토큰을 확인해 주세요' }, '토큰을 확인해 주세요'],
    ])('%o → %s', (status, text) => expect(statusText(status, now)).toBe(text));
});
