import { Socket } from 'socket.io';
import { WhiteCard } from './WhiteCard';

export class Player {

  public readonly id: string;
  public readonly username: string;
  public readonly socket: Socket;
  public readonly score: number;
  public readonly whiteCards: Array<WhiteCard>;

  constructor(username: string, socket: Socket) {
    this.id = socket.id;
    this.username = username;
    this.socket = socket;
    this.score = 0;
    this.whiteCards = new Array<WhiteCard>();
    this.fillCardDeck().then();


    this.socket.on('player.cards', args => this._getAllCardTexts());
  }

  private _getAllCardTexts() {
      this.socket.emit('player.cards', this.getAllCards());
  }

  private async fillCardDeck() {
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

  private getAllCards(): any {
      return this.whiteCards.map((card) => {
         return card;
      });
  }

  public disconnect(): void {
      //this.socket.leaveAll();
      //this.socket.removeAllListeners();
      this.socket.disconnect();
  }

}