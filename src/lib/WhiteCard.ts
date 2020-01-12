import { Card } from '../types';
import { Firestore } from '@google-cloud/firestore';

export class WhiteCard implements Card {

    private static db: any = new Firestore().collection('answers');
    private static cards: any;
    private id: string;
    public text: string;

    public constructor(id: string = null, text: string = null) {
        this.id = id;
        this.text = text;
    }

    // @ts-ignore
    public static getById(cardId: string): WhiteCard {
        WhiteCard.cards.forEach((card) => {
            if (card.id === cardId) {
                return new WhiteCard(card.id, card.text);
            }
        });
    }

    public async init(): Promise<any> {
        try {
            WhiteCard.cards = await WhiteCard.getAllCardsFromDatabase();
            let card: any = WhiteCard.cards[Math.floor(Math.random() * WhiteCard.cards.length)];
            this.id = card.id;
            this.text = card.text;
        } catch (err) {
            throw new Error(err);
        }
    }

    private static async getAllCardsFromDatabase(): Promise<any[]> {
        try {
            const snapshot = await WhiteCard.db.get();
            if (snapshot) {
                return snapshot.docs.map((doc: any) => {
                    return new WhiteCard(doc.id, doc.data().text);
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

}