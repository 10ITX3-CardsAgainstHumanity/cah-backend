import {WhiteCard} from "./lib/WhiteCard";
import {BlackCard} from "./lib/BlackCard";
import {Player} from "./lib/Player";

export enum GameState {
    'undefined',
    'lobby',
    'selection',
    'judging',
    'overview'
}

export interface Card {
    readonly text: string;
    getText(): string;
}

export interface PlayerResponse {
    id: String,
    username: String,
    isCzar?: boolean
}

export interface allChoosedPlayerCardsResponse {
    [index: number]: {
        playerId: string,
        [cards: number]: Partial<WhiteCard>
    }
}

export interface ResponseMessage {
    status: boolean,
    msg?: {
        state?: keyof typeof GameState
        player?: PlayerResponse,
        players?: Partial<Player>[]
        card?: Partial<BlackCard>,
        cards?: Partial<WhiteCard>[]
    } | string
}
