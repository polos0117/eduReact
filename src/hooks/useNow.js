import { useEffect, useState } from 'react';

// 1분마다 갱신되는 현재 시각. 자정을 넘겨 켜 두어도 "오늘"이 맞는다.
export function useNow(intervalMs = 60_000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);
    return now;
}
