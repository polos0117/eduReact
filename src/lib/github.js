// GitHub Contents API 로 저장소의 할 일 파일 하나를 읽고 쓴다. fetch 는 테스트를 위해 받는다.
// 저장할 때마다 커밋이 하나 생긴다. ponytail: Contents API 는 1MB 넘는 파일의 내용을 주지 않는다 — 할 일 수천 개 수준까지는 충분

const API = 'https://api.github.com';

export class SyncError extends Error {
    constructor(kind, message) {
        super(message);
        this.kind = kind; // 'auth' | 'notfound' | 'conflict' | 'network' | 'bad' | 'other'
    }
}

// 한글이 깨지지 않게 UTF-8 바이트로 바꾼 뒤 base64
export function toBase64(text) {
    let bin = '';
    for (const b of new TextEncoder().encode(text)) bin += String.fromCharCode(b);
    return btoa(bin);
}
export function fromBase64(b64) {
    const bin = atob(b64.replace(/\s/g, ''));
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

function failure(status) {
    if (status === 401 || status === 403) return new SyncError('auth', '토큰을 확인해 주세요');
    if (status === 404) return new SyncError('notfound', '저장소를 찾지 못했어요');
    if (status === 409 || status === 422) return new SyncError('conflict', '그새 다른 기기가 저장했어요');
    return new SyncError('other', `GitHub 오류 (${status}) — 다시 시도해요`);
}

export function createClient({ repo, path, token, fetch = globalThis.fetch.bind(globalThis) }) {
    const repoUrl = `${API}/repos/${repo}`;
    const fileUrl = `${repoUrl}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    async function call(url, init = {}) {
        try {
            // no-store: GitHub 응답은 60초 캐시돼 옛 sha 를 받으면 저장이 계속 거절된다
            return await fetch(url, { ...init, headers: { ...headers, ...init.headers }, cache: 'no-store' });
        } catch {
            throw new SyncError('network', '인터넷에 연결되지 않았어요');
        }
    }
    return {
        async checkRepo() {
            const res = await call(repoUrl);
            if (!res.ok) throw failure(res.status);
        },
        async read() {
            const res = await call(fileUrl);
            if (res.status === 404) {
                // 파일이 없거나, 저장소가 없거나 권한이 빠졌거나(GitHub 는 그때도 404). 뒤의 경우를 "빈 목록"으로 보면 할 일이 다 지워진다
                await this.checkRepo();
                return { todos: null, sha: null };
            }
            if (!res.ok) throw failure(res.status);
            const json = await res.json();
            let data;
            try { data = JSON.parse(fromBase64(json.content)); } catch { throw new SyncError('bad', '저장소의 할 일 파일을 읽지 못했어요'); }
            const todos = Array.isArray(data) ? data : data?.todos;
            if (!Array.isArray(todos)) throw new SyncError('bad', '저장소의 할 일 파일 모양이 달라요');
            return { todos, sha: json.sha };
        },
        async write(todos, sha, message) {
            const body = { message, content: toBase64(`${JSON.stringify({ version: 1, todos }, null, 2)}\n`) };
            if (sha) body.sha = sha;
            const res = await call(fileUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw failure(res.status);
            return (await res.json()).content.sha;
        },
    };
}
