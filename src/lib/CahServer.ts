import { createServer, Server } from 'http';
import * as socketIo from 'socket.io';

import {Game} from './Game';
import {Player} from './Player';
import {Socket} from "socket.io";
import {ResponseMessage} from "../types";
import {CahDatabase} from "./CahDatabase";

export class CahServer {

  public static readonly PORT: number = 80;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;

  constructor() {
    this.initServer();
    this.initSocketIo();
    this.initDatabase();
    this.listen();
  }

  private initServer(): void {
    this.server = createServer();
    this.port = process.env.PORT || CahServer.PORT;
  }

  private initSocketIo(): void {
    this.io = socketIo(this.server);
  }

  private initDatabase(): void {
    const db: CahDatabase = CahDatabase.instance;
    db.init().then(() => {
      console.log('database is ready');
    });
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log(`running CahServer on port ${this.port}`);
	});

    const allGames = {};

    this.io.on('connect', (socket: Socket) => {
      console.log(`+ ${socket.id}`);

      let player: Player = null;
      let game: Game = null;

      //game.create
      socket.on('game.create', ({ username, gameId }) => {
        if (player || game) {
          socket.emit('game.create', { status: false, msg: 'error' } as ResponseMessage);
          return;
        }

        player = new Player(username, socket);
        game = new Game(player, gameId, this.io.to(gameId));

        allGames[game.id] = game;
        game.addPlayer(player);

        let playerResponse = { player: { id: player.id, username: player.username } };
        socket.emit('game.create', { status: true, msg: playerResponse } as ResponseMessage);
        socket.emit('game.join', { status: true, msg: playerResponse } as ResponseMessage);
      });

      //game.join
      socket.on('game.join', ({ username, gameId }) => {
        if (player || game) {
          socket.emit('game.join', { status: false, msg: 'error' } as ResponseMessage);
          return;
        }

        player = new Player(username, socket);

        game = allGames[gameId];
        if (!game) {
          socket.emit('game.join', { status: false, msg: 'invalid game' } as ResponseMessage);
          game = undefined;
          player = undefined;
          return;
        }
        game.addPlayer(player);

        socket.emit('game.join', {
          status: true,
          msg: {
            player: {
              id: player.id,
              username: player.username
            }
          }
        } as ResponseMessage);
      });

      //disconnect
      socket.on('disconnect', () => {
        console.log(`- ${socket.id}`);
        if (game && player) {
          game.removePlayer(player);
        }
	  });
	});
  }
}
