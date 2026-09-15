import { createContext, useContext } from 'react';
import { tagClass } from '../lib/tags';

// 사용자가 고른 태그 색({ 태그: 0..3 })을 트리 전체가 읽는다.
// 목록 → 항목까지 4단계라 props 로 내리는 대신 context 를 쓴다.
const TagColorContext = createContext(undefined);

export const TagColorProvider = TagColorContext.Provider;

export function useTagClass() {
    const overrides = useContext(TagColorContext);
    return (tag) => tagClass(tag, overrides);
}
