import {test, expect} from 'vitest';
import {todoReducer, sortByPriority, normalizeTodo, parseTags, subtaskProgress} from './todoReducer';

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

    test('TOGGLE_ALL은 하나라도 미완료면 전부 완료로 만든다', () => {
        const state = [{ id: 1, text: 'a', completed: true }, { id: 2, text: 'b', completed: false }];
        const result = todoReducer(state, { type: 'TOGGLE_ALL' });
        expect(result.every(todo => todo.completed)).toBe(true);
    });
    test('TOGGLE_ALL은 전부 완료면 전부 해제한다', () => {
        const state = [{ id: 1, text: 'a', completed: true }, { id: 2, text: 'b', completed: true }];
        const result = todoReducer(state, { type: 'TOGGLE_ALL' });
        expect(result.every(todo => !todo.completed)).toBe(true);
    });
    test('RESTORE는 지정한 index에 todo를 되돌려 넣는다', () => {
        const state = [{ id: 1, text: 'a' }, { id: 3, text: 'c' }];
        const result = todoReducer(state, { type: 'RESTORE', todo: { id: 2, text: 'b' }, index: 1 });
        expect(result.map(todo => todo.id)).toEqual([1, 2, 3]);
        expect(result).not.toBe(state);
    });

    test('SET_PRIORITY는 id가 일치하는 todo의 priority만 바꾼다', () => {
        const state = [{ id: 1, text: 'a', priority: 'normal' }, { id: 2, text: 'b', priority: 'normal' }];
        const result = todoReducer(state, { type: 'SET_PRIORITY', id: 2, priority: 'high' });
        expect(result).toEqual([{ id: 1, text: 'a', priority: 'normal' }, { id: 2, text: 'b', priority: 'high' }]);
    });
    test('sortByPriority는 높음→보통→낮음 순이고, priority 없는 todo는 보통으로 취급하며 원본을 바꾸지 않는다', () => {
        const state = [{ id: 1, priority: 'low' }, { id: 2 }, { id: 3, priority: 'high' }, { id: 4, priority: 'normal' }];
        const result = sortByPriority(state);
        expect(result.map(todo => todo.id)).toEqual([3, 2, 4, 1]);
        expect(state.map(todo => todo.id)).toEqual([1, 2, 3, 4]);
    });

    test('TOGGLE은 완료할 때 completedAt을 기록하고 해제하면 지운다', () => {
        const done = todoReducer([{ id: 1, text: 'a', completed: false }], { type: 'TOGGLE', id: 1, at: 123 });
        expect(done[0].completedAt).toBe(123);
        const undone = todoReducer(done, { type: 'TOGGLE', id: 1, at: 456 });
        expect(undone[0].completedAt).toBeUndefined();
    });
    test('SET_DUE는 dueDate를 넣고, 빈 값이면 지운다', () => {
        const state = [{ id: 1, text: 'a' }];
        const withDue = todoReducer(state, { type: 'SET_DUE', id: 1, dueDate: '2026-09-20' });
        expect(withDue[0].dueDate).toBe('2026-09-20');
        expect(todoReducer(withDue, { type: 'SET_DUE', id: 1, dueDate: '' })[0].dueDate).toBeUndefined();
    });
    test('IMPORT는 이미 있는 id를 건너뛰고 새 것만 붙인다', () => {
        const state = [{ id: 1, text: 'a' }];
        const result = todoReducer(state, { type: 'IMPORT', todos: [{ id: 1, text: 'dup' }, { id: 2, text: 'b' }] });
        expect(result.map(todo => todo.id)).toEqual([1, 2]);
        expect(result[0].text).toBe('a');
    });
    test('normalizeTodo는 모양이 틀린 것은 버리고 빠진 필드는 채운다', () => {
        expect(normalizeTodo(null)).toBeNull();
        expect(normalizeTodo({ text: '   ' })).toBeNull();
        expect(normalizeTodo({ text: ' 우유 ', priority: 'weird', dueDate: '20260920', completed: 'yes' }, 99))
            .toEqual({ id: 99, text: '우유', completed: false, priority: 'normal', createdAt: 99 });
        expect(normalizeTodo({ id: 5, text: 'a', completed: true, completedAt: 7, dueDate: '2026-09-20', priority: 'high', createdAt: 1 }))
            .toEqual({ id: 5, text: 'a', completed: true, completedAt: 7, dueDate: '2026-09-20', priority: 'high', createdAt: 1 });
    });

    test('ADD_NOTE / EDIT_NOTE / REMOVE_NOTE는 해당 todo의 notes만 바꾼다', () => {
        const state = [{ id: 1, text: 'a' }, { id: 2, text: 'b' }];
        const note = { id: 10, category: 'backend', text: 'GET /api/todos', createdAt: 1 };
        const added = todoReducer(state, { type: 'ADD_NOTE', id: 1, note });
        expect(added[0].notes).toEqual([note]);
        expect(added[1].notes).toBeUndefined();
        const edited = todoReducer(added, { type: 'EDIT_NOTE', id: 1, noteId: 10, text: 'POST /api/todos', category: 'frontend' });
        expect(edited[0].notes[0]).toEqual({ ...note, text: 'POST /api/todos', category: 'frontend' });
        const removed = todoReducer(edited, { type: 'REMOVE_NOTE', id: 1, noteId: 10 });
        expect(removed[0].notes).toEqual([]);
    });
    test('normalizeTodo는 notes도 검증하고 코드의 공백은 보존한다', () => {
        const result = normalizeTodo({ id: 1, text: 'a', notes: [
            { id: 5, category: 'nope', text: '  indented\n  code  ' },
            { text: '' },
            'garbage',
        ] }, 100);
        expect(result.notes).toEqual([{ id: 5, category: 'memo', text: '  indented\n  code  ', createdAt: 101 }]);
        expect(normalizeTodo({ id: 1, text: 'a', notes: [] }).notes).toBeUndefined();
    });

    test('normalizeTodo는 createdAt이 없으면 id(초기 버전의 Date.now())를 생성 시각으로 쓴다', () => {
        expect(normalizeTodo({ id: 1700000000000, text: 'a' }, 5).createdAt).toBe(1700000000000);
        expect(normalizeTodo({ text: 'a' }, 5).createdAt).toBe(5);
    });

    test('하위 항목: ADD / TOGGLE / EDIT / REMOVE_SUBTASK 와 진행률', () => {
        const state = [{ id: 1, text: 'a' }];
        let s = todoReducer(state, { type: 'ADD_SUBTASK', id: 1, subtask: { id: 10, text: '라디오', done: false } });
        s = todoReducer(s, { type: 'ADD_SUBTASK', id: 1, subtask: { id: 11, text: '엑셀', done: false } });
        s = todoReducer(s, { type: 'TOGGLE_SUBTASK', id: 1, subtaskId: 10 });
        expect(subtaskProgress(s[0])).toEqual({ done: 1, total: 2 });
        s = todoReducer(s, { type: 'EDIT_SUBTASK', id: 1, subtaskId: 11, text: '엑셀 다운로드' });
        expect(s[0].subtasks[1].text).toBe('엑셀 다운로드');
        s = todoReducer(s, { type: 'REMOVE_SUBTASK', id: 1, subtaskId: 10 });
        expect(s[0].subtasks.map(x => x.id)).toEqual([11]);
        expect(subtaskProgress({})).toEqual({ done: 0, total: 0 });
    });
    test('SET_TAGS는 정리해서 넣고 비면 필드를 지운다', () => {
        const state = [{ id: 1, text: 'a' }];
        const tagged = todoReducer(state, { type: 'SET_TAGS', id: 1, tags: [' #kipa ', 'kipa', '', '개인'] });
        expect(tagged[0].tags).toEqual(['kipa', '개인']);
        expect(todoReducer(tagged, { type: 'SET_TAGS', id: 1, tags: [] })[0].tags).toBeUndefined();
    });
    test('parseTags는 제목 끝의 #태그를 떼어내고, 태그만 있으면 제목을 남긴다', () => {
        expect(parseTags('우유 사기 #개인 #장보기')).toEqual({ text: '우유 사기', tags: ['개인', '장보기'] });
        expect(parseTags('C#으로 작성')).toEqual({ text: 'C#으로 작성', tags: [] });
        expect(parseTags('#kipa')).toEqual({ text: '#kipa', tags: ['kipa'] });
    });
    test('normalizeTodo는 subtasks와 tags도 검증한다', () => {
        const t = normalizeTodo({ id: 1, text: 'a', subtasks: [{ id: 5, text: ' x ', done: 'yes' }, { text: '' }], tags: ['a', 'a', 3] }, 100);
        expect(t.subtasks).toEqual([{ id: 5, text: 'x', done: false }]);
        expect(t.tags).toEqual(['a']);
        expect(normalizeTodo({ id: 1, text: 'a', tags: [] }).tags).toBeUndefined();
    });
