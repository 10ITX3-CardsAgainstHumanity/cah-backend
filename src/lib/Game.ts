import { GameState } from '../types';
import { Player } from './Player';
import { BlackCard } from "./BlackCard";

export class Game {

  public readonly id: string;
  public socket: any;
  private state: GameState;
  private hostPlayer: Player;
  private czar: Player;
  private blackCard: BlackCard;
  private blackCardHistory: Array<BlackCard>;
  private players: Array<Player>;

  constructor(hostPlayer: Player, gameId: string) {
    this.id = gameId;
    this.state = GameState.lobby;
    this.hostPlayer = hostPlayer;
    this.players = Array<Player>();
    this.blackCardHistory = Array<BlackCard>();

    BlackCard.init();

    this.hostPlayer.socket.on('game.start', args => this.start());
  }

  public addPlayer(player: Player): boolean {
    if (this.state !== GameState.lobby) {
      return false;
    }
    this.players.push(player);
    player.socket.join(this.id);
    this.socket.emit('player.join', { status: true, msg: {
        id: player.id,
        username: player.username
    }});
    player.socket.on('game.leave', args => this.removePlayer(player));
    return true;
  }

  public removePlayer(player: Player): boolean {
    if (!this.players) {
      return false;
    }
    this.players = this.players.filter(p => p.id !== player.id);
    player.disconnect();
    this.socket.emit('player.leave', { status: true, msg: {
        id: player.id,
        username: player.username
    }});
    return true;
  }

  private chooseCzar(): void {
      let setCzarState: boolean = false;
      let player: Player = null;
      while (!setCzarState) {
          player = this.players[Math.floor(Math.random() * this.players.length)];
          setCzarState = this.setCzar(player);
      }
      this.socket.emit('player.czar', {
          status: true,
          msg: {
              id: player.id,
              username: player.username
          }
      });
  }

  private setCzar(player: Player): boolean {
      if (player === this.czar) {
          return false;
      }

      this.czar = player;
      return true;
  }

  private chooseBlackCard(): void {
      let setBlackCardState: boolean = false;
      let card: BlackCard = null;
      while (!setBlackCardState) {
          card = BlackCard.cards[Math.floor(Math.random() * BlackCard.cards.length)];
          setBlackCardState = this.setBlackCard(card);
      }
      this.socket.emit('game.cards.black', { status: true, msg: {
          card: {
              id: card.getId(),
              text: card.getText(),
              neededAnswers: card.getNeededAnswers()
          }
      }});
  }

  private setBlackCard(card: BlackCard): boolean {
      if (this.blackCardHistory.includes(card)) {
          return false;
      } else {
          this.blackCard = card;
          this.blackCardHistory.push(card);
          return true;
      }
  }

  private start():void {
    if (this.state !== GameState.lobby) {
      return;
    }

    this.chooseCzar();
    this.chooseBlackCard();
    this.selection();

    this.socket.emit('game.start', { status: true });

    //this.enterSelection(); // TODO: Implement this function
  }

  private emitGameState(): void {
      this.socket.emit('game.state', { status: true, msg: { state: GameState[this.state] } });
  }

  private selection(): void {
      this.state = GameState.selection
      this.emitGameState();
      let phase = setInterval(() => {
          let areAllPlayersReady = true;
          this.players.forEach((player: Player) => {
              if (player.choosedCards.length !== this.blackCard.getNeededAnswers()) {
                  areAllPlayersReady = false
              }
          });
          if (areAllPlayersReady) {
              clearInterval(phase);
              this.state = GameState.judging;
              this.emitGameState();
          }
      }, 2500);
  }

}
