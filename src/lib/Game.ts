import { v4 } from 'uuid';

import { Player } from './Player';

enum GameState {
  'undefined',
  'lobby'
}

export class Game {

  public readonly id: string;
  public room: any;
  private state: GameState;
  private hostPlayer: Player;
  private players: Array<Player>;

  constructor(hostPlayer: Player) {
    this.id = v4();
    this.state = GameState.lobby;
    this.hostPlayer = hostPlayer;
    this.players = Array<Player>();
  }

  public addPlayer(player: Player): boolean {
    if (this.state !== GameState.lobby) {
      return false;
    }
    this.players.push(player);
    player.socket.join(this.id);
  }

  public removePlayer(player: Player): boolean {
    if (!this.players) {
      return false;
    }
    this.players = this.players.filter(p => p.id !== player.id);
    return true;
  }

}
