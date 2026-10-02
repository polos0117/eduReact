import { describe, expect, it } from 'vitest';
import { createClient, fromBase64, SyncError, toBase64 } from './github';

// 가짜 fetch: 받은 요청을 적어 두고 정해 둔 응답을 돌려준다
function fakeFetch(responses) {
    const calls = [];
    const fetch = async (url, init = {}) => {
        calls.push({ url, ...init, body: init.body ? JSON.parse(init.body) : undefined });
        const r = responses.shift();
        if (r instanceof Error) throw r;
        return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.body };
    };
    return { fetch, calls };
}
const client = (f) => createClient({ repo: 'me/todo-data', path: 'todos.json', token: 'tok', fetch: f.fetch });

describe('base64 (UTF-8)', () => {
    it('한글 왕복', () => {
        expect(fromBase64(toBase64('할 일 ✓ 🎉'))).toBe('할 일 ✓ 🎉');
        expect(fromBase64(`${toBase64('가나다라마바사')}\n`)).toBe('가나다라마바사'); // GitHub 는 줄바꿈을 섞어 준다
    });
});

describe('createClient', () => {
    it('read: 주소·헤더·캐시 끄기, 내용과 sha', async () => {
        const f = fakeFetch([{ status: 200, body: { sha: 'abc', content: toBase64(JSON.stringify({ version: 1, todos: [{ id: 1, text: '가' }] })) } }]);
        expect(await client(f).read()).toEqual({ todos: [{ id: 1, text: '가' }], sha: 'abc' });
        const [c] = f.calls;
        expect(c.url).toBe('https://api.github.com/repos/me/todo-data/contents/todos.json');
        expect(c.cache).toBe('no-store');
        expect(c.headers).toMatchObject({ Authorization: 'Bearer tok', Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });
    });
    it('read: 파일이 없으면(404) 빈 상태', async () => {
        expect(await client(fakeFetch([{ status: 404, body: {} }, { status: 200, body: {} }])).read()).toEqual({ todos: null, sha: null });
    });
    it('read: 배열만 있는 파일도 받는다, 깨진 파일은 bad', async () => {
        const arr = fakeFetch([{ status: 200, body: { sha: 's', content: toBase64('[{"id":2,"text":"나"}]') } }]);
        expect((await client(arr).read()).todos).toEqual([{ id: 2, text: '나' }]);
        const broken = fakeFetch([{ status: 200, body: { sha: 's', content: toBase64('{') } }]);
        await expect(client(broken).read()).rejects.toMatchObject({ kind: 'bad' });
    });
    it('write: PUT 본문(메시지·base64·sha), 새 sha', async () => {
        const f = fakeFetch([{ status: 200, body: { content: { sha: 'new' } } }]);
        expect(await client(f).write([{ id: 1, text: '가' }], 'old', '할 일 동기화 (PC)')).toBe('new');
        const [c] = f.calls;
        expect(c.method).toBe('PUT');
        expect(c.body.message).toBe('할 일 동기화 (PC)');
        expect(c.body.sha).toBe('old');
        expect(fromBase64(c.body.content)).toBe(`${JSON.stringify({ version: 1, todos: [{ id: 1, text: '가' }] }, null, 2)}\n`);
    });
    it('write: 처음 만들 때는 sha 를 보내지 않는다', async () => {
        const f = fakeFetch([{ status: 201, body: { content: { sha: 'first' } } }]);
        await client(f).write([], null, 'm');
        expect('sha' in f.calls[0].body).toBe(false);
    });
    it.each([[401, 'auth'], [403, 'auth'], [409, 'conflict'], [422, 'conflict'], [500, 'other']])('HTTP %i → %s', async (status, kind) => {
        await expect(client(fakeFetch([{ status, body: {} }])).write([], 's', 'm')).rejects.toMatchObject({ kind });
    });
    it('read: 파일이 없을 때 저장소도 없으면(권한을 뺐거나 지움) notfound — 빈 목록으로 보지 않는다', async () => {
        await expect(client(fakeFetch([{ status: 404, body: {} }, { status: 404, body: {} }])).read()).rejects.toMatchObject({ kind: 'notfound' });
        expect(await client(fakeFetch([{ status: 404, body: {} }, { status: 200, body: {} }])).read()).toEqual({ todos: null, sha: null });
    });
    it('네트워크 오류 → network, checkRepo 의 404 → notfound', async () => {
        await expect(client(fakeFetch([new TypeError('Failed to fetch')])).read()).rejects.toBeInstanceOf(SyncError);
        await expect(client(fakeFetch([new TypeError('x')])).read()).rejects.toMatchObject({ kind: 'network' });
        await expect(client(fakeFetch([{ status: 404, body: {} }])).checkRepo()).rejects.toMatchObject({ kind: 'notfound' });
        const ok = fakeFetch([{ status: 200, body: {} }]);
        await client(ok).checkRepo();
        expect(ok.calls[0].url).toBe('https://api.github.com/repos/me/todo-data');
    });
});
