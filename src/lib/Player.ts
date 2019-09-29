import { Socket } from 'socket.io';

export class Player {

  public readonly id: string;
  public readonly username: string;
  public readonly socket: Socket;
  public readonly score: number;

  constructor(username: string, socket: Socket) {
    this.id = socket.id;
    this.username = username;
    this.socket = socket;
  }

}