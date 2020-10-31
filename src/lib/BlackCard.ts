import {Card} from '../types';
import {CahDatabase, CardTypes, ICardData} from "./CahDatabase";

export class BlackCard implements Card {
	private static db: CahDatabase = CahDatabase.instance;
	public static cards: BlackCard[];
	private readonly id: string;
	public readonly text: string;
	private readonly neededAnswers: number;

	public constructor(id: string = null, text: string = null) {
		this.id = id;
		this.text = text;
		this.neededAnswers = BlackCard.parseNeededAnswersOfText(text);
	}

	private static parseNeededAnswersOfText(text: string): number {
		let matches: RegExpMatchArray | null = text.match(/_+/g);
		return matches ? matches.length : 1;
	}

	public static getById(cardId: string): BlackCard {
		return BlackCard.cards.find((card: BlackCard) => card.id === cardId);
	}

	public static async init(): Promise<any> {
		try {
			BlackCard.cards = await BlackCard.getAllCardsFromDatabase();
			return Promise.resolve();
		} catch (err) {
			throw new Error(err);
			// TODO: Maybe do something better than throwing when a error happens
			// try init again or reset the complete room and close it down but dont end the whole server like that
		}
	}

	private static async getAllCardsFromDatabase(): Promise<BlackCard[]> {
		try {
			const snapshot: ICardData[] = await BlackCard.db.getAllCards(CardTypes.blackCards);
			if (snapshot) {
				return snapshot.map((doc: ICardData) => {
					return new BlackCard(doc.uid, doc.text);
				})
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
