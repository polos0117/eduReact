// 태그 색: 기본은 이름 해시로 자동 배정, 사용자가 고르면 그 색이 이긴다.
// 자동 배정은 4색뿐이다 — 색각 이상에서도 서로 구분되는 한도가 거기까지라서
// (dataviz 검증기로 라이트·다크 모두 전체 쌍 통과). 직접 고르면 그 제약은 없다.
export const TAG_COLOR_COUNT = 4;

// 색 고르기 상자의 시작값. 실제로 칠할 때는 테마별 CSS 변수(--tag-0..3)를 쓰므로
// 여기 값은 "직접 고르기"를 눌렀을 때 보여 줄 기본값일 뿐이다.
const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#c2185b'];

const HEX = /^#[0-9a-f]{6}$/i;

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

// overrides: { 태그: '#rrggbb' } — 사용자가 고른 색.
// 예전 판에서 저장한 0..3 숫자도 그대로 받아 준다.
export function tagColorIndex(tag, overrides) {
    const picked = overrides?.[tag];
    return Number.isInteger(picked) && picked >= 0 && picked < TAG_COLOR_COUNT ? picked : hashIndex(tag);
}

// 직접 고른 색이면 그 hex, 아니면 null (= 자동)
export function customColor(tag, overrides) {
    const picked = overrides?.[tag];
    return typeof picked === 'string' && HEX.test(picked) ? picked : null;
}

// 칩에 붙일 것 — 자동이면 테마별 변수를 쓰는 클래스, 직접 고른 색이면 인라인 변수.
export function tagStyle(tag, overrides) {
    const hex = customColor(tag, overrides);
    return hex
        ? { className: 'tag-custom', style: { '--tag': hex } }
        : { className: `tag-c${tagColorIndex(tag, overrides)}`, style: undefined };
}

// 색 고르기 상자에 처음 보여 줄 값
export const pickerValue = (tag, overrides) =>
    customColor(tag, overrides) ?? PALETTE[tagColorIndex(tag, overrides)];

// 태그 칩이 가리키는 목록 주소
export const tagHref = (tag) => `#todos?tag=${encodeURIComponent(tag)}`;
