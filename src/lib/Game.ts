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
	private round: number;

	constructor(hostPlayer: Player, gameId: string, socket: any) {
		this.socket = socket;
		this.id = gameId;
		this.state = GameState.unstarted;
		this.hostPlayer = hostPlayer;
		this.players = [];
		this.blackCardHistory = [];
		this.round = 0;

		BlackCard.init();

		this.setCzar(hostPlayer);
	}

	public addPlayer(player: Player): boolean {
		if (this.state !== GameState.unstarted) {
			return false;
		}
		this.players.push(player);
		player.socket.join(this.id);
		this.socket.to(this.id).emit('player.join', {
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

		this.socket.to(this.id).emit('player.leave', {
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

		this.socket.to(this.id).emit('player.czar', {
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
		this.czar.socket.on('game.start', args => this.start());
		return true;
	}

	private czarChooseWinner(playerId: string): void {
		if (this.state === GameState.judging) {
			let validPlayer: Player = this.players.find((player: Player) => (player.id === playerId && player.id !== this.czar.id));
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
		this.socket.to(this.id).emit('game.cards.black', {
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
		this.state = GameState.start;
		this.emitGameState();
		!this.round ? this.socket.to(this.id).emit('game.start', { status: true } as ResponseMessage) : ''; // only emit game.start at round 0
		this.round ? this.chooseCzar() : ''; // only choose czar at round >0
		this.chooseBlackCard();
		this.selection();
	}

	private emitGameState(): void {
		this.socket.to(this.id).emit('game.state', {
			status: true,
			msg: {
				state: this.state
			}
		} as ResponseMessage);
	}

	private selection(): void {
		this.state = GameState.selection;
		this.emitGameState();
		let phase = setInterval(() => {
			let areAllPlayersReady = true;
			this.players.forEach((player: Player) => {
				if (player.id !== this.czar.id && player.choosedCards.length !== this.blackCard.getNeededAnswers()) {
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
		let players: Player[] = this.players.filter(player => player.choosedCards.length > 0);
		let data: allChoosedPlayerCardsResponse = players.map((player: Player) => {
			if (player.id !== this.czar.id) {
				return {
					playerId: player.id,
					cards: player.choosedCards.map((card: WhiteCard) => {
						return {
							id: card.getId(),
							text: card.getText()
						}
					})
				}
			}
		});

		this.socket.to(this.id).emit('game.players.cards', { status: true, msg: data } as ResponseMessage);
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
					username: this.czarSelectedWinner.username,
					score: this.czarSelectedWinner.score
				};
				this.socket.to(this.id).emit('game.czar.judged', { status: true, msg: {
						player: winnerPlayer
					}} as ResponseMessage);
				this.players.forEach((player: Player) => {
					player.prepareForNextRound();
				});
				this.round++;
				this.start();
			}
		}, 2500);
	}
}
