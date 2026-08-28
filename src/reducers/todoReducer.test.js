import {test, expect} from 'vitest';
import {todoReducer} from './todoReducer';

test('addTest', () => {
        const state = [];
        const action = { type: 'ADD', todo: { id: 1, text: '우유 사기', completed: false } };
        const result = todoReducer(state, action);
        expect(result).toEqual([{ id: 1, text: '우유 사기', completed: false }]);
    });
test('ADD는 기존 todo를 유지한 채 끝에 추가한다', () => {
        const state = [{id: 1, text: '기존일', completed: false}];
        const action = { type: 'ADD', todo: { id: 2, text: '우유 사기', completed: false } };
        const result = todoReducer(state, action);
        expect(result).toEqual([{ id: 1, text: '기존일', completed: false }, { id: 2, text: '우유 사기', completed: false }]);
    });
