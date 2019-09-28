import { createServer, Server } from 'http';
import * as socketIo from 'socket.io';

//import * as Game from 'Game';
//import * as Payer from 'Player';

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

    this.io.on('connect', (socket: any) => {
      console.log(`+ ${socket.id}`);

      setInterval(() => {
      	this.io.emit('time', Date.now());
	  }, 1000);

      socket.on('disconnect', () => {
        console.log(`- ${socket.id}`);
	  });
	});
  }

}