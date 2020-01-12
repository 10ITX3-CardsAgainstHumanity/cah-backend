import { Card } from '../types';
import { Firestore } from '@google-cloud/firestore';
import {WhiteCard} from "./WhiteCard";

export class BlackCard implements Card {

    private static db: any = new Firestore().collection('questions');
    public static cards: any;
    private readonly id: string;
    public readonly text: string;
    private readonly neededAnswers: number;

    public constructor(id: string = null, text: string = null) {
        this.id = id;
        this.text = text;
        this.neededAnswers = BlackCard.parseNeededAnswersOfText(text);
    }

    private static parseNeededAnswersOfText(text: string): number {
        return text.match(new RegExp('___', 'g')).length;
    }

    // @ts-ignore
    public static getById(cardId: string): BlackCard {
        BlackCard.cards.forEach((card) => {
            if (card.id === cardId) {
                return new BlackCard(card.id, card.text);
            }
        });
    }

    public static async init(): Promise<any> {
        BlackCard.cards = await BlackCard.getAllCardsFromDatabase();
    }

    private static async getAllCardsFromDatabase(): Promise<any[]> {
        try {
            const snapshot = await BlackCard.db.get();
            if (snapshot) {
                return snapshot.docs.map((doc: any) => {
                    return new BlackCard(doc.id, doc.data().text);
                });
            }
        } catch (err) {
            throw new Error(err);
        }
    }

    public getId(): string {
        return this.id;
    }

    public getText(): string {
        return this.text;
    }

    public getNeededAnswers(): number {
        return this.neededAnswers;
    }
}