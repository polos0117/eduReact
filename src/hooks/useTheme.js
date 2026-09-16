import { useEffect, useState } from "react";

// <html>의 data-* 속성 하나를 localStorage와 묶는 훅.
// options[0]이 기본값이고, 기본값일 때는 속성을 아예 지운다 (CSS의 :root가 그대로 적용).
function useRootAttr(attr, storageKey, options, { crossfade = false } = {}) {
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return options.includes(saved) ? saved : options[0];
        } catch { return options[0]; }
    });
    useEffect(() => {
        const root = document.documentElement;
        const next = value === options[0] ? null : value;
        const apply = () => {
            if (next === null) root.removeAttribute(attr);
            else root.setAttribute(attr, next);
        };
        // 스킨처럼 화면 전체가 바뀌는 건 겹쳐지며 바뀌게 — 처음 마운트(이미 같은 값)에는 하지 않는다
        const changed = root.getAttribute(attr) !== next;
        const animate = crossfade && changed && typeof document.startViewTransition === 'function'
            && !matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (animate) document.startViewTransition(apply);
        else apply();
        try { localStorage.setItem(storageKey, value); } catch { /* 저장 실패해도 화면은 바뀐다 */ }
    }, [attr, storageKey, options, value, crossfade]);
    return [value, setValue];
}

export const THEMES = [['system', '시스템'], ['light', '라이트'], ['dark', '다크']];

// [키, 이름, 한 줄 설명]. 순서가 곧 드롭다운·설정 카드의 순서다 (밝은 것 → 어두운 것 → 보조)
export const SKINS = [
    ['classic', '클래식', '흰 시트와 헤어라인'],
    ['paper', '종이', '공책, 볼펜, 색인 탭'],
    ['sumuk', '수묵', '한지와 먹, 완료 낙관'],
    ['clay', '말랑', '푹신한 클레이'],
    ['neo', '네오', '유리와 네온'],
    ['terminal', '터미널', '인광 CRT'],
    ['blueprint', '청사진', '바랜 남색 설계도'],
    ['contrast', '고대비', '굵은 선, 큰 초점 링'],
];

const THEME_KEYS = THEMES.map(([key]) => key);
const SKIN_KEYS = SKINS.map(([key]) => key);

// 'system'이면 data-theme을 지워서 prefers-color-scheme에 맡긴다
export function useTheme() {
    return useRootAttr('data-theme', 'theme', THEME_KEYS);
}

// 'classic'은 기본 CSS, 나머지는 skins.css / skin-neo.css 가 토큰과 재질을 덮어쓴다
export function useSkin() {
    return useRootAttr('data-skin', 'skin', SKIN_KEYS, { crossfade: true });
}
