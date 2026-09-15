// 태그 색: 기본은 이름 해시로 자동 배정, 사용자가 고르면 그 색이 이긴다.
// 색 수가 4개인 건 취향이 아니라 제약이다 — dataviz 검증기로 라이트·다크 모두
// 전체 쌍(CVD·대비)을 통과하는 한도가 4색이었다. 5색째는 다크에서 보라가 파랑과 겹친다.
// 태그가 4개를 넘으면 색은 겹치고, 신원은 늘 함께 찍히는 태그 이름이 진다.
export const TAG_COLOR_COUNT = 4;
export const TAG_COLOR_LABELS = ['파랑', '주황', '초록', '자홍'];

// FNV-1a + murmur3 마무리(fmix32).
// 마무리가 꼭 필요하다: %4 는 하위 2비트만 보는데, 섞지 않으면 그 비트가 글자 코드의
// 하위 비트에 그대로 끌려간다. 한글 음절은 그쪽이 한 방향으로 몰려 있어서
// '잔여'·'개선'·'완료'처럼 흔한 태그가 전부 같은 색이 됐다.
function hashIndex(tag) {
    let h = 2166136261;
    for (let i = 0; i < tag.length; i++) {
        h = Math.imul(h ^ tag.codePointAt(i), 16777619);
    }
    h ^= h >>> 16;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) % TAG_COLOR_COUNT;
}

// overrides: { 태그: 0..3 } — 사용자가 고른 색. 없거나 범위 밖이면 해시로.
export function tagColorIndex(tag, overrides) {
    const picked = overrides?.[tag];
    return Number.isInteger(picked) && picked >= 0 && picked < TAG_COLOR_COUNT ? picked : hashIndex(tag);
}

export const tagClass = (tag, overrides) => `tag-c${tagColorIndex(tag, overrides)}`;

// 태그 칩이 가리키는 목록 주소
export const tagHref = (tag) => `#todos?tag=${encodeURIComponent(tag)}`;
