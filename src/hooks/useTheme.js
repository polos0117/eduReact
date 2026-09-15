import { useEffect, useState } from "react";

// <html>의 data-* 속성 하나를 localStorage와 묶어 순환시키는 훅.
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
    function cycle() {
        setValue(v => options[(options.indexOf(v) + 1) % options.length]);
    }
    return [value, cycle];
}

const THEMES = ['system', 'light', 'dark'];
const SKINS = ['classic', 'neo'];

// 'system'이면 data-theme을 지워서 prefers-color-scheme에 맡긴다
export function useTheme() {
    return useRootAttr('data-theme', 'theme', THEMES);
}

// 'classic'은 기본 CSS, 'neo'는 skin-neo.css가 토큰을 덮어쓴다
export function useSkin() {
    return useRootAttr('data-skin', 'skin', SKINS);
}
