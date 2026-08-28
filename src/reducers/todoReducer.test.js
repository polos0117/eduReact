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

    test('TOGGLE은 id가 일치하는 todo의 completed를 반전시킨다', () => {
        const state = [{ id: 1, text: '기존일', completed: false }];
        const action = { type: 'TOGGLE', id: 1 };
        const result = todoReducer(state, action);
        expect(result).toEqual([{ id: 1, text: '기존일', completed: true }]);
    });
    test('TOGGLE은 다른 todo는 안 건드린다', () => {
        const state = [{ id: 1, text: '기존일', completed: false }, {id:2, text:'기존일2',completed: true}];
        const action = { type: 'TOGGLE', id: 2 };
        const result = todoReducer(state, action);
        expect(result).toEqual([{ id: 1, text: '기존일', completed: false }, { id: 2, text: '기존일2', completed: false }]);
        expect(result).not.toBe(state);
    });

    test('REMOVE는 id가 일치하는 todo만 제거한다', () => {
        const state = [{ id: 1, text: '기존일'}, {id:2, text:'기존일2'}];
        const action = { type: 'REMOVE', id: 1 };
        const result = todoReducer(state, action);
        expect(result).toEqual([{ id: 2, text: '기존일2' }]);
    });

    test('EDIT는 id가 일치하는 text만 변경시킨다.', () => {
        const state = [{ id: 1, text: '기존일'}, {id:2, text:'기존일2'}];
        const action = { type: 'EDIT', id: 1 , newText : '변경된 일'};
        const result = todoReducer(state, action);
        expect(result).toEqual([{ id: 1, text: '변경된 일'}, {id:2, text:'기존일2'}]);
    });

    test('모르는 액션이 오면 기존 상태를 그대로 반환한다', () => {
        const state = [{ id: 1, text: '기존일', completed : false}];
        const action = { type: 'none', id: 1 , text : '변경된 일', completed : true};
        const result = todoReducer(state, action);
        expect(result).toBe(state);
    });
