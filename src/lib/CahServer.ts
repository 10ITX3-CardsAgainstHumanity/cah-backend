import { createServer, Server } from 'http';
import * as socketIo from 'socket.io';
import * as fs from 'fs';

import { Game } from './Game';
import { Player } from './Player';
import {Socket} from "socket.io";

export class CahServer {

  public static readonly PORT: number = 80;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;

  constructor() {
    this.initServer();
    this.initSocketIo();
    this.listen();
  }

  private initServer(): void {
    this.server = createServer();
    this.port = process.env.PORT || CahServer.PORT;
  }

  private initSocketIo(): void {
    this.io = socketIo(this.server);
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log(`running CahServer on port ${this.port}`);
	});

    var allGames = {};

    this.io.on('connect', (socket: Socket) => {
      console.log(`+ ${socket.id}`);

      let player: Player = null;
      let game: Game = null;

      //game.create
      socket.on('game.create', ({ username, maxScore }, res) => {
        if (player || game) {
          res({ status: false, msg: 'error' });
          return;
        }
        player = new Player(username, socket);
        game = new Game(player, maxScore);
        allGames[game.id] = game;
        socket.join(game.id);
        game.room = this.io.to(game.id);
        res({ status: true, msg: game.id });
      });

      //game.join
      socket.on('game.join', ({ username, gameId }, res) => {
        if (player || game) {
          res({ status: false, msg: 'error' });
          return;
        }
        player = new Player(username, socket);
        game = allGames[gameId];
        if (!game) {
          res({ status: false, msg: 'invalid game' });
          return;
        }
        game.addPlayer(player);
        res({ status: true, msg: 'joined game' });
      });

      //disconnect
      socket.on('disconnect', () => {
        console.log(`- ${socket.id}`);
        if (game !== null && player !== null) {
          game.removePlayer(player);
		}
	  });
	});
  }

}