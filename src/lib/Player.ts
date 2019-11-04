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
    this.fillCardDeck();

    this.socket.on('player.cards', args => this._getAllCardTexts());
  }

  private _getAllCardTexts() {
      this.socket.emit('player.cards.res', this.getAllCardTexts());
  }

  private fillCardDeck() {
      // todo cleanup
      this.addCard();
      this.addCard();
      this.addCard();
      this.addCard();
      this.addCard();
      this.addCard();
      this.addCard();
      this.addCard();
      this.addCard();
      this.addCard();
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
  }

  private getAllCardTexts(): any {
      let res = [];
      this.whiteCards.forEach((card) => {
          res.push(card.getText());
      });
      return res;
  }

  public disconnect(): void {
      //this.socket.leaveAll();
      //this.socket.removeAllListeners();
      this.socket.disconnect();
  }

}