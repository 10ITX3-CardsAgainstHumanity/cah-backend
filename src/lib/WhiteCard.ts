import {Card} from '../types';
import {Firestore} from '@google-cloud/firestore';
import CollectionReference = FirebaseFirestore.CollectionReference;

export class WhiteCard implements Card {

    private static db: CollectionReference = new Firestore().collection('answers');
    public static cards: Array<WhiteCard> = [];
    private id: string;
    public text: string;

    public constructor(id: string = null, text: string = null) {
        this.id = id;
        this.text = text;
    }

    public static getById(cardId: string): WhiteCard|null {
        return WhiteCard.cards.find((card: WhiteCard) => cardId === card.getId());
    }

    public async init(): Promise<void> {
        try {
            WhiteCard.cards = await WhiteCard.getAllCardsFromDatabase();
            let card: WhiteCard = WhiteCard.cards[Math.floor(Math.random() * WhiteCard.cards.length)];
            this.id = card.id;
            this.text = card.text;
            return Promise.resolve();
        } catch (err) {
            // TODO: Maybe do something better than throwing when a error happens
            // try init again or reset the complete room and close it down but dont end the whole server like that
            throw new Error(err);
        }
    }

    private static async getAllCardsFromDatabase(): Promise<WhiteCard[]> {
        try {
            const snapshot = await WhiteCard.db.get();
            if (snapshot) {
                return snapshot.docs.map((doc: any) => {
                    return new WhiteCard(doc.id, doc.data().text);
                });
            }
        } catch (err) {
            // TODO: Maybe do something better than throwing when a error happens
            // try init again or reset the complete room and close it down but dont end the whole server like that
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
