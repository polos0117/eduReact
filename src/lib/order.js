// 직접 정렬에서 한 칸 옮기기: 화면에 보이는 순서(ids)에서 바로 앞/뒤 항목을 찾아
// MOVE 액션에 넘길 { targetId, after } 를 만든다. 옮길 곳이 없으면 null
export function moveTarget(ids, id, dir) {
    const at = ids.indexOf(id);
    if (at < 0) return null;
    const next = dir === 'up' ? at - 1 : at + 1;
    if (next < 0 || next >= ids.length) return null;
    return { targetId: ids[next], after: dir === 'down' };
}
