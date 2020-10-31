import * as fs from "fs";

export interface ICardData {
	uid: string,
	text: string
}

interface IData {
	whiteCards: ICardData[],
	blackCards: ICardData[]
}

export enum CardTypes {
	whiteCards,
	blackCards
}

export class CahDatabase {
	private static _instance: CahDatabase;
	private _data: IData;

	private constructor() {}

	public static get instance() {
		!CahDatabase._instance ? CahDatabase._instance = new CahDatabase() : '';
		return CahDatabase._instance;
	}

	public async init(): Promise<void> {
		const dataBuffer: Buffer = await fs.readFileSync(__dirname + '/../../database.json');
		this._data = JSON.parse(dataBuffer.toString()) as IData;
	}

	private static getRandomKey(cardData: ICardData[]): number {
		const objKeys: string[] = Object.keys(cardData);
		const ranKey: number = +objKeys[Math.floor(Math.random() * objKeys.length)];
		return ranKey;
	}

	public getAllCards(cardTypes: CardTypes): ICardData[] {
		return this._data[CardTypes[cardTypes]];
	}

	public getRandomCard(cardTypes: CardTypes): ICardData {
		const cards: ICardData[] = this._data[CardTypes[cardTypes]];
		return cards[CahDatabase.getRandomKey(cards)];
	}
}
