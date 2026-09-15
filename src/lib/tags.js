// 태그 색: 이름을 해시해 고정 팔레트에서 고른다. 설정 없이 같은 태그는 늘 같은 색.
// 4색뿐이라 태그가 많으면 색이 겹친다 — 색은 묶음을 눈에 띄게 하는 보조 신호이고,
// 신원은 항상 함께 찍히는 태그 이름이 진다.
// 팔레트는 dataviz 검증기로 라이트·다크 모두 전체 쌍 통과(CVD·대비).
export const TAG_COLOR_COUNT = 4;

// FNV-1a + murmur3 마무리(fmix32).
// 마무리가 꼭 필요하다: %4 는 하위 2비트만 보는데, 섞지 않으면 그 비트가 글자 코드의
// 하위 비트에 그대로 끌려간다. 한글 음절은 그쪽이 한 방향으로 몰려 있어서
// '잔여'·'개선'·'완료'처럼 흔한 태그가 전부 같은 색이 됐다.
export function tagColorIndex(tag) {
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

export const tagClass = (tag) => `tag-c${tagColorIndex(tag)}`;

// 태그 칩이 가리키는 목록 주소
export const tagHref = (tag) => `#todos?tag=${encodeURIComponent(tag)}`;
