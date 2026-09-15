import { useReducer, useEffect } from "react";

const REPLACE = '@persisted/replace';

// useReducer + localStorage.
// sanitize(raw)는 저장소에서 읽은 값(신뢰 불가)을 올바른 모양의 상태로 바꾼다.
// 다른 브라우저 탭이 같은 key를 바꾸면 storage 이벤트로 받아 그대로 반영한다.
export function usePersistedReducer(reducer, key, initialValue, sanitize = (raw) => raw) {
    function load(json) {
        try {
            return json == null ? initialValue : sanitize(JSON.parse(json));
        } catch {
            return initialValue; // 깨진 값이 저장돼 있어도 앱은 떠야 한다
        }
    }
    const [state, dispatch] = useReducer(
        (state, action) => action.type === REPLACE ? action.state : reducer(state, action),
        null,
        () => { try { return load(localStorage.getItem(key)); } catch { return initialValue; } },
    );

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage`, error);
        }
    }, [state, key]);

    useEffect(() => {
        function onStorage(e) {
            if (e.key === key) dispatch({ type: REPLACE, state: load(e.newValue) });
        }
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- load는 props로만 바뀐다

    return [state, dispatch];
}
