import { v4 } from 'uuid';

import { Player } from './Player';

enum GameState {
  'undefined',
  'lobby'
}

export class Game {

  public readonly id: string;
  public socket: any;
  private state: GameState;
  private hostPlayer: Player;
  private players: Array<Player>;
  private maxScore: number;

  constructor(hostPlayer: Player, maxScore: number) {
    this.id = v4();
    this.state = GameState.lobby;
    this.hostPlayer = hostPlayer;
    this.players = Array<Player>();
    this.maxScore = maxScore;
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
    player.socket.leaveAll();
    player.socket.removeAllListeners();
    this.socket.emit('player.leave', { id: player.id, username: player.username });
    return true;
  }

}
