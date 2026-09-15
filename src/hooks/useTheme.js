import { useEffect, useState } from "react";

// <html>의 data-* 속성 하나를 localStorage와 묶는 훅.
// options[0]이 기본값이고, 기본값일 때는 속성을 아예 지운다 (CSS의 :root가 그대로 적용).
function useRootAttr(attr, storageKey, options) {
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return options.includes(saved) ? saved : options[0];
        } catch { return options[0]; }
    });
    useEffect(() => {
        const root = document.documentElement;
        if (value === options[0]) root.removeAttribute(attr);
        else root.setAttribute(attr, value);
        try { localStorage.setItem(storageKey, value); } catch { /* 저장 실패해도 화면은 바뀐다 */ }
    }, [attr, storageKey, options, value]);
    return [value, setValue];
}

export const THEMES = [['system', '시스템'], ['light', '라이트'], ['dark', '다크']];
export const SKINS = [['classic', '클래식'], ['paper', '종이'], ['neo', '네오'], ['terminal', '터미널'], ['contrast', '고대비']];

const THEME_KEYS = THEMES.map(([key]) => key);
const SKIN_KEYS = SKINS.map(([key]) => key);

// 'system'이면 data-theme을 지워서 prefers-color-scheme에 맡긴다
export function useTheme() {
    return useRootAttr('data-theme', 'theme', THEME_KEYS);
}

// 'classic'은 기본 CSS, 'neo'는 skin-neo.css가 토큰을 덮어쓴다
export function useSkin() {
    return useRootAttr('data-skin', 'skin', SKIN_KEYS);
}
