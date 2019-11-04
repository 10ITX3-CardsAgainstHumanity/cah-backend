import { Card } from '../types';
import { Firestore } from '@google-cloud/firestore';

export class WhiteCard implements Card {

    private static db: any = new Firestore().collection('answers');
    private static cards: any;
    private id: string;
    public text: string;

    public constructor() {
    }

    public async init(): Promise<any> {
        try {
            WhiteCard.cards = await WhiteCard.getAllCardsFromDatabase();
            let card: any = WhiteCard.cards[Math.floor(Math.random() * WhiteCard.cards.length)];
            this.id = card.id;
            this.text = card.text;
        } catch (err) {
            console.error(err);
        }
    }

    private static async getAllCardsFromDatabase(): Promise<any[]> {
        try {
            const snapshot = await WhiteCard.db.get();
            if (snapshot) {
                return snapshot.docs.map((doc: any) => {
                    return {
                        id: doc.id,
                        text: doc.data().text
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    public getId(): string {
        return this.id;
    }

    public getText(): string {
        return this.text;
    }

}