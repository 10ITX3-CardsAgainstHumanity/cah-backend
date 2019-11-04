export enum GameState {
    'undefined',
    'lobby',
    'selection',
    'judging'
}

export interface Card {
    readonly text: string;
    getText(): string;
}