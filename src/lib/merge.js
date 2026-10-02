// 할 일 동기화의 3-way 합치기. base = 이 기기가 마지막으로 동기화에 성공한 목록.
// 할 일마다 "그때 이후 어느 쪽이 바뀌었나"로 정한다 — 고친 시각 같은 필드 없이.
//   한쪽만 바뀜 → 바뀐 쪽 · 양쪽 바뀜 → 이 기기 · 한쪽에서 지움 → 지움(다른 쪽이 고쳤으면 살림)

// 키 순서·undefined 값과 상관없이 같은 내용인지 (JSON 으로 왕복한 원격 값과 비교하려고)
function stable(v) {
    if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
    if (v && typeof v === 'object') {
        return `{${Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;
    }
    return JSON.stringify(v);
}
export const sameTodo = (a, b) => stable(a) === stable(b);
const sameList = (a, b) => a.length === b.length && a.every((t, i) => sameTodo(t, b[i]));
const byId = (list) => new Map(list.map(t => [t.id, t]));
const idsWhere = (list, keep) => list.map(t => t.id).filter(keep);

export function mergeTodos(base, local, remote) {
    const B = byId(base), L = byId(local), R = byId(remote);
    const kept = new Map();
    for (const id of new Set([...L.keys(), ...R.keys()])) {
        const b = B.get(id), l = L.get(id), r = R.get(id);
        let out;
        if (!b) out = l ?? r;                              // 새로 만든 것 — 양쪽이면 이 기기 것
        else if (l && r) out = sameTodo(l, b) ? r : l;     // 고친 쪽, 양쪽 다 고쳤으면 이 기기
        else if (l) out = sameTodo(l, b) ? null : l;       // 다른 기기에서 지움 — 이 기기에서 고쳤으면 살린다
        else out = sameTodo(r, b) ? null : r;              // 이 기기에서 지움 — 다른 기기에서 고쳤으면 살린다
        if (out) kept.set(id, out);
    }
    const todos = arrange(kept, base, local, remote).map(id => kept.get(id));
    return { todos, changedLocal: !sameList(todos, local), changedRemote: !sameList(todos, remote) };
}

// 순서: 이 기기에서 순서를 바꿨으면(base 와 둘 다 있는 할 일들의 차례가 다르면) 이 기기 순서, 아니면 원격 순서를 뼈대로.
// 뼈대에 없는 할 일은 다른 쪽 목록의 앞 이웃 뒤(없으면 뒤 이웃 앞, 그것도 없으면 끝)에 끼운다.
function arrange(kept, base, local, remote) {
    const inBase = new Set(base.map(t => t.id)), inLocal = new Set(local.map(t => t.id));
    const shared = (id) => inBase.has(id) && inLocal.has(id);
    const localMoved = idsWhere(local, shared).join() !== idsWhere(base, shared).join();
    const [primary, secondary] = localMoved ? [local, remote] : [remote, local];
    const out = idsWhere(primary, id => kept.has(id));
    const placed = new Set(out);
    const other = secondary.map(t => t.id);
    other.forEach((id, i) => {
        if (!kept.has(id) || placed.has(id)) return;
        const prev = other.slice(0, i).reverse().find(x => placed.has(x));
        const next = other.slice(i + 1).find(x => placed.has(x));
        const at = prev !== undefined ? out.indexOf(prev) + 1 : next !== undefined ? out.indexOf(next) : out.length;
        out.splice(at, 0, id);
        placed.add(id);
    });
    return out;
}
