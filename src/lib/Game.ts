import { v4 } from 'uuid';

import { GameState } from '../types';
import { Player } from './Player';

export class Game {

  public readonly id: string;
  public socket: any;
  private state: GameState;
  private hostPlayer: Player;
  private czar: Player;
  private players: Array<Player>;

  constructor(hostPlayer: Player) {
    this.id = v4();
    this.state = GameState.lobby;
    this.hostPlayer = hostPlayer;
    this.players = Array<Player>();

    this.hostPlayer.socket.on('game.start', args => this.start());
  }

  public addPlayer(player: Player): boolean {
    if (this.state !== GameState.lobby) {
      return false;
    }
    this.players.push(player);
    player.socket.join(this.id);
    this.socket.emit('player.join', { id: player.id, username: player.username });
    player.socket.on('game.leave', args => this.removePlayer(player));
    return true;
  }

  public removePlayer(player: Player): boolean {
    if (!this.players) {
      return false;
    }
    this.players = this.players.filter(p => p.id !== player.id);
    player.disconnect();
    this.socket.emit('player.leave', { id: player.id, username: player.username });
    return true;
  }

  private chooseCzar(): void {
      let setCzarState: boolean = false;
      let player: Player = null;
      while (!setCzarState) {
          player = this.players[Math.floor(Math.random() * this.players.length)];
          setCzarState = this.setCzar(player);
      }
      this.socket.emit('player.czar', { id: player.id, username: player.username });
  }

  private setCzar(player: Player): boolean {
      if (player === this.czar) {
          return false;
      }

      this.czar = player;
      return true;
  }

  private start():void {
    if (this.state !== GameState.lobby) {
      return;
    }

    this.chooseCzar();

    this.socket.emit('game.start', { status: true });

    //this.enterSelection(); // TODO: Implement this function
  }

}
