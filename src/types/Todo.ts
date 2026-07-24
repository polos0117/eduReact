export interface Todo {
    readonly id: number;
    text: string;   
    completed: boolean;
}

export type TodoAction =
    | { type: 'ADD'; payload: Todo }
    | { type: 'TOGGLE'; id: number }
    | { type: 'REMOVE'; id: number }
    | { type: 'EDIT'; id: number; newText: string };