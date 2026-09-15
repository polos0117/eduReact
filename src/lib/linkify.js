// 노트 본문에서 링크로 만들 조각을 찾는다. 렌더는 컴포넌트가 한다.
// URL → { type: 'url', value }  ·  r5074 같은 커밋 번호 → { type: 'rev', value: '5074' }
const URL_RE = /https?:\/\/[^\s<>"'“”)\]]+/;
const REV_RE = /\br(\d{3,})\b/;

export function linkify(text) {
    const pattern = new RegExp(`(${URL_RE.source})|(${REV_RE.source})`, 'g');
    const parts = [];
    let last = 0;
    for (const m of text.matchAll(pattern)) {
        if (m.index > last) parts.push({ type: 'text', value: text.slice(last, m.index) });
        if (m[1]) parts.push({ type: 'url', value: m[1] });
        else parts.push({ type: 'rev', value: m[3], raw: m[2] });
        last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
    return parts;
}

// 설정의 "https://svn.example.com/rev/{n}" 에 번호를 끼운다
export function revUrl(template, n) {
    return template.includes('{n}') ? template.replace('{n}', n) : template + n;
}
