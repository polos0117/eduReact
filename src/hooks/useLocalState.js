import { useEffect, useState } from 'react';

// useState + localStorage (JSON). 작은 설정값용 — 큰 상태는 usePersistedReducer.
export function useLocalState(key, initial) {
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved == null ? initial : JSON.parse(saved);
        } catch { return initial; }
    });
    useEffect(() => {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 실패해도 동작은 한다 */ }
    }, [key, value]);
    return [value, setValue];
}
