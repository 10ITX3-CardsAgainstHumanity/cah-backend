import {GameState, ResponseMessage, allChoosedPlayerCardsResponse} from '../types';
import {Player} from './Player';
import {BlackCard} from "./BlackCard";
import {WhiteCard} from "./WhiteCard";
import {Socket} from "socket.io";

export class Game {

  public readonly id: string;
  public socket: Socket;
  private state: GameState;
  private hostPlayer: Player;
  private czar: Player;
  private blackCard: BlackCard;
  private blackCardHistory: Array<BlackCard>;
  private players: Array<Player>;
  private czarSelectedWinner: Player;

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
    this.socket.emit('player.join', {
        status: true,
        msg: {
            player: { id: player.id, username: player.username }
        }
    } as ResponseMessage);
    player.socket.on('game.leave', args => this.removePlayer(player));
    player.socket.on('game.players', args => this.emitAllPlayers(player.socket));
    return true;
  }

  public emitAllPlayers(responseSocket: Socket): void {
      let playersInActualGame: Partial<Player>[] = this.players.map((playerInActualGame: Player) => {
          return {
              id: playerInActualGame.id,
              username: playerInActualGame.username,
              score: playerInActualGame.score,
              isCzar: playerInActualGame.id === this.czar.id,
              isHost: playerInActualGame.id === this.hostPlayer.id
          }
      });

      responseSocket.emit('game.players', {
          status: true,
          msg: {
              players: playersInActualGame
          }
      } as ResponseMessage);
  }

  public removePlayer(player: Player): boolean {
    if (!this.players) {
      return false;
    }
    this.players = this.players.filter(p => p.id !== player.id);
    player.disconnect();

    this.socket.emit('player.leave', {
        status: true,
        msg: {
            player: { id: player.id, username: player.username }
        }
    } as ResponseMessage);
    return true;
  }

  private isThisCardInThisRound(card) {
      let cardValid: boolean = false;
      this.players.forEach((player: Player) => {
          if (player.hasPlayerThisCard(card)) {
              cardValid = true;
          }
      });
      return cardValid;
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
              player: { id: player.id, username: player.username }
          }
      } as ResponseMessage);
  }

  private setCzar(player: Player): boolean {
      if (player === this.czar) {
          return false;
      }

      this.czar = player;
      this.czar.socket.on('game.czar.judge', args => this.czarChooseWinner(args.playerId));
      return true;
  }

  private czarChooseWinner(playerId: string): void {
      if (this.state === GameState.judging) {
          let validPlayer: Player = this.players.find((player: Player) => player.id === playerId);
          if (validPlayer) {
              this.czarSelectedWinner = validPlayer;
              this.czarSelectedWinner.countScoreOneUp();
              this.czar.socket.emit('game.czar.judge', { status: true } as ResponseMessage);
          } else {
              this.czar.socket.emit('game.czar.judge', { status: false, msg: 'invalid player' } as ResponseMessage);
          }
      } else {
          this.czar.socket.emit('game.czar.judge', {status: false, msg: 'invalid game state'} as ResponseMessage);
      }
  }

  private chooseBlackCard(): void {
      let setBlackCardState: boolean = false;
      let card: BlackCard = null;
      while (!setBlackCardState) {
          card = BlackCard.cards[Math.floor(Math.random() * BlackCard.cards.length)];
          setBlackCardState = this.setBlackCard(card);
      }
      this.socket.emit('game.cards.black', {
          status: true,
          msg: {
              card: {
                  id: card.getId(),
                  text: card.getText(),
                  neededAnswers: card.getNeededAnswers()
              }
          }
      } as ResponseMessage);
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

  private start(): void {
    if (this.state !== GameState.lobby) {
      return;
    }

    this.socket.emit('game.start', { status: true } as ResponseMessage);

    !this.czar ? this.chooseCzar() : '';
    this.chooseBlackCard();
    this.selection();
  }

  private emitGameState(): void {
      this.socket.emit('game.state', {
          status: true,
          msg: {
              state: GameState[this.state]
          }
      } as ResponseMessage);
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
      let data: allChoosedPlayerCardsResponse = this.players.map((player: Player) => {
          return {
              playerId: player.id,
              cards: player.choosedCards.map((card: WhiteCard) => {
                  return {
                      id: card.getId(),
                      text: card.getText()
                  }
              })
          }
      });

      this.socket.emit('game.players.cards', { status: true, msg: data } as ResponseMessage);
  }

  private judging(): void {
      this.state = GameState.judging;
      this.emitGameState();
      this.czarSelectedWinner = null;

      let phase = setInterval(() => {
          let hasCzarJudged = this.czarSelectedWinner;
          if (hasCzarJudged) {
              clearInterval(phase);
              let winnerPlayer: Partial<Player> = {
                  id: this.czarSelectedWinner.id,
                  username: this.czarSelectedWinner.username
              };
              this.socket.emit('game.czar.judged', { status: true, msg: {
                  player: winnerPlayer
              }} as ResponseMessage);
              this.overview();
          }
      }, 2500);

  }

  private overview() : void {
      this.state = GameState.overview;
      this.emitGameState();
      this.emitAllPlayers(this.socket);
      setTimeout(() => {
          this.start();
      }, 5000);
  }
}
