// 태그 색: 이름을 해시해 고정 팔레트에서 고른다. 설정 없이 같은 태그는 늘 같은 색.
// 4색뿐이라 태그가 많으면 색이 겹친다 — 색은 묶음을 눈에 띄게 하는 보조 신호이고,
// 신원은 항상 함께 찍히는 태그 이름이 진다.
// 팔레트는 dataviz 검증기로 라이트·다크 모두 전체 쌍 통과(CVD·대비).
export const TAG_COLOR_COUNT = 4;

export function tagColorIndex(tag) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.codePointAt(i)) >>> 0;
    return hash % TAG_COLOR_COUNT;
}

export const tagClass = (tag) => `tag-c${tagColorIndex(tag)}`;

// 태그 칩이 가리키는 목록 주소
export const tagHref = (tag) => `#todos?tag=${encodeURIComponent(tag)}`;
