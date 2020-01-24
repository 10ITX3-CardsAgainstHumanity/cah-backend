import { GameState, PlayerResponse } from '../types';
import { Player } from './Player';
import { BlackCard } from "./BlackCard";
import { WhiteCard } from "./WhiteCard";

export class Game {

  public readonly id: string;
  public socket: any;
  private state: GameState;
  private hostPlayer: Player;
  private czar: Player;
  private blackCard: BlackCard;
  private blackCardHistory: Array<BlackCard>;
  private players: Array<Player>;

  constructor(hostPlayer: Player, gameId: string, socket: any) {
    this.socket = socket;
    this.id = gameId;
    this.state = GameState.lobby;
    this.hostPlayer = hostPlayer;
    this.players = [];
    this.blackCardHistory = [];

    BlackCard.init();

    this.setCzar(hostPlayer);
    this.hostPlayer.socket.on('game.start', args => this.start());
  }

  public addPlayer(player: Player): boolean {
    if (this.state !== GameState.lobby) {
      return false;
    }
    this.players.push(player);
    player.socket.join(this.id);
    let playerResponse: PlayerResponse = { id: player.id, username: player.username };
    this.socket.emit('player.join', { status: true, msg: playerResponse });
    player.socket.on('game.leave', args => this.removePlayer(player));
    player.socket.on('game.players', args => this.emitAllPlayers(player));
    return true;
  }

  public emitAllPlayers(player: Player): void {
      let playersInActualGame: Partial<Player>[] = this.players.map((playerInActualGame: Player) => {
          return {
              id: playerInActualGame.id,
              username: playerInActualGame.username,
              isCzar: playerInActualGame.id === this.czar.id
          }
      });

      player.socket.emit('game.players', { status: true, msg: {
          players: playersInActualGame
      }});
  }

  public removePlayer(player: Player): boolean {
    if (!this.players) {
      return false;
    }
    this.players = this.players.filter(p => p.id !== player.id);
    player.disconnect();
    let playerResponse: PlayerResponse = { id: player.id, username: player.username };
    this.socket.emit('player.leave', { status: true, msg: playerResponse});
    return true;
  }

  private chooseCzar(): void {
      let setCzarState: boolean = false;
      let player: Player = null;
      while (!setCzarState) {
          player = this.players[Math.floor(Math.random() * this.players.length)];
          setCzarState = this.setCzar(player);
      }
      let playerResponse: PlayerResponse = { id: player.id, username: player.username };
      this.socket.emit('player.czar', { status: true, msg: playerResponse });
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

    this.socket.emit('game.start', { status: true });

    !this.czar ? this.chooseCzar() : '';
    this.chooseBlackCard();
    this.selection();
  }

  private emitGameState(): void {
      this.socket.emit('game.state', { status: true, msg: { state: GameState[this.state] } });
  }

  private selection(): void {
      this.state = GameState.selection;
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
              this.emitAllChoosedPlayerCards();
              this.judging();
          }
      }, 2500);
  }

  private emitAllChoosedPlayerCards(): void {
      let msg: any = [];
      this.players.forEach((player: Player) => {
          let cards: any = [];
          player.choosedCards.forEach((card: WhiteCard) => {
              cards = [ ...cards, { id: card.getId(), text: card.getText() } ];
          });
          msg = [ ...msg, { playerId: player.id, cards: cards } ];
      });
      this.socket.emit('game.players.cards', { status: true, msg: msg });
  }

  private judging(): void {
      this.state = GameState.judging;
      this.emitGameState();
  }

}
