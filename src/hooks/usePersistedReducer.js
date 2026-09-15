import { useReducer, useEffect } from "react";

export function usePersistedReducer(reducer, key, initialValue) {
    const [state, dispatch] = useReducer(reducer, initialValue, (initial) => {
        try {
            const persisted = localStorage.getItem(key);
            return persisted ? JSON.parse(persisted) : initial;
        } catch {
            return initial; // 깨진 값이 저장돼 있어도 앱은 떠야 한다
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage`, error);
        }
    }, [state, key]);
    return [state, dispatch];
}
