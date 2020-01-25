import { Socket } from 'socket.io';
import { WhiteCard } from './WhiteCard';
import {ResponseMessage} from "../types";

export class Player {

  public readonly id: string;
  public readonly username: string;
  public readonly socket: Socket;
  public score: number;
  public readonly choosedCards: Array<WhiteCard>;
  public readonly whiteCards: Array<WhiteCard>;

  constructor(username: string, socket: Socket) {
    this.id = socket.id;
    this.username = username;
    this.socket = socket;
    this.score = 0;
    this.choosedCards = [];
    this.whiteCards = [];
    this.fillCardDeck().then(() => { this.socket.emit('player.cards.ready', { status: true } as ResponseMessage) });

    this.socket.on('player.cards', args => this._getAllCardTexts());
    this.socket.on('player.cards.choose', args => this._chooseCard(args.cardId));
  }

  private _getAllCardTexts(): void {
      this.socket.emit('player.cards', { status: true, msg: { cards: this.getAllCards() }} as ResponseMessage);
  }

  private async fillCardDeck(): Promise<void> {
      while (this.whiteCards.length < 10) {
          await this.addCard();
      }
  }

  private async addCard(): Promise<void> {
      let isNewCardValid: boolean = false;
      while (!isNewCardValid) {
          let newCard = new WhiteCard();
          await newCard.init(); // init db and get all cards
          let _isNewCardValid: boolean = true;
          this.whiteCards.forEach((card: WhiteCard) => {
             if (card.getId() === newCard.getId()) {
                 _isNewCardValid = false;
             }
          });
          if (_isNewCardValid) {
              this.whiteCards.push(newCard);
              isNewCardValid = true;
          }
      }
      return Promise.resolve();
  }

  private getAllCards(): WhiteCard[] {
      return this.whiteCards.map((card) => {
         return card;
      });
  }

  public hasPlayerThisCard(card: WhiteCard): boolean {
      let whiteCardsIds = this.whiteCards.map((c: WhiteCard) => {
          return c.getId();
      });
      return whiteCardsIds.includes(card.getId());
  }

  public _chooseCard(cardId: string): void {
      let card: WhiteCard = WhiteCard.getById(cardId);
      this.chooseCard(card);
  }

  public chooseCard(card: WhiteCard): void {
      if (!this.hasPlayerThisCard(card)) {
          this.socket.emit('player.cards.choose', { status: false, msg: 'Player does not have this card' } as ResponseMessage);
      }

      this.choosedCards.push(card);

      const index = this.whiteCards.findIndex((card: WhiteCard) => card.getId() === card.getId());
      if (index > -1) {
        this.whiteCards.splice(index, 1);
      }


      this.socket.emit('player.cards.choose', { status: true } as ResponseMessage);
  }

  public countScoreOneUp(): void {
      this.score++;
  }

  public disconnect(): void {
      //this.socket.leaveAll();
      //this.socket.removeAllListeners();
      this.socket.disconnect();
  }

}
