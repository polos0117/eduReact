import { mergeTodos } from './merge';

// 한 번의 동기화: 받기 → 합치기 → (바뀌었으면) 올리기. 그새 다른 기기가 올렸으면(충돌) 다시 받아 최대 maxTries 번.
// 의존성을 받아서 화면·브라우저 없이 테스트한다.
export async function syncOnce({ client, getLocal, setLocal, getBase, setBase, normalize, device, maxTries = 3 }) {
    for (let attempt = 1; ; attempt++) {
        const remote = await client.read();
        const remoteTodos = remote.todos === null ? [] : normalize(remote.todos);
        const { todos, changedLocal, changedRemote } = mergeTodos(getBase() ?? [], getLocal(), remoteTodos);
        if (changedLocal) setLocal(todos);
        // 원격 파일이 이미 같으면 올리지 않는다 (파일이 아직 없으면 만든다)
        if (!changedRemote && remote.sha) {
            setBase(todos);
            return { pushed: false };
        }
        try {
            await client.write(todos, remote.sha, `할 일 동기화 (${device})`);
            setBase(todos);
            return { pushed: true };
        } catch (error) {
            if (error.kind !== 'conflict' || attempt >= maxTries) throw error;
        }
    }
}

// 머리글 상태 글
export function statusText(status, now) {
    switch (status.kind) {
        case 'syncing': return '동기화 중…';
        case 'offline': return '오프라인 — 연결되면 올려요';
        case 'error': return status.message;
        case 'ok': {
            const minutes = Math.floor((now - status.at) / 60_000);
            if (minutes < 1) return '동기화됨 · 방금';
            if (minutes < 60) return `동기화됨 · ${minutes}분 전`;
            return `동기화됨 · ${Math.floor(minutes / 60)}시간 전`;
        }
        default: return '';
    }
}
