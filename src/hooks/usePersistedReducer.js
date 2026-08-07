import { useReducer, useEffect } from "react";

export function usePersistedReducer(reducer, key, initialValue) {
    const [state, dispatch] = useReducer(reducer, initialValue, (initial) => {
        const persisted = localStorage.getItem(key);
        return persisted ? JSON.parse(persisted) : initial;
    });
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage`, error);
        }
    },[state, key]);
    return [state, dispatch];
  
}

