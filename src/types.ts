import {WhiteCard} from "./lib/WhiteCard";
import {BlackCard} from "./lib/BlackCard";
import {Player} from "./lib/Player";

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

export interface PlayerResponse {
    id: String,
    username: String,
    isCzar?: boolean
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
