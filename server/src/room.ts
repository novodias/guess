import WebSocket from "ws";
import Song from "./models/song.model";
import Player, { PlayerChangeEvent, Players } from "./player";
import { intFromInterval, makeid } from './utils';
import { v4 as uuid } from 'uuid';
import EventEmitter from "events";

export interface RoomConfig {
    name: string;
    password?: string;
    particular: boolean;
}

export interface MusicDetails {
    hash: string;
    partialPath: string;
}

// interface MessageRequestHandler {
//     [k: string]: () => void;
// }
// type MessageKey = keyof MessageRequestHandler;

abstract class Room {
    static readonly STATUS = Object.freeze({
        WAITING: 'waiting',
        PREPARING: 'preparing',
        STARTED: 'started',
        ENDED: 'ended'
    });

    public readonly id: string;
    public readonly name: string;
    public readonly particular: boolean;
    public readonly password?: string;
    public readonly ownerUID: string;
    public readonly players: Players;

    public listeners: any;
    public messageEventEmitter: EventEmitter;

    public status: string;
    public rounds: number;
    public roundTime: number;
    public roundPrepare: number;
    public roundsMax: number;

    public musics: Song[];
    public music?: Song;
    public musicDetails?: MusicDetails;

    public timer?: NodeJS.Timeout;
    public timerCallback: () => void;

    constructor(id: string, config: RoomConfig, songs: Song[]) {
        this.id = id;
        this.name = config.name;
        this.particular = config.particular;
        this.password = config.password;
        this.ownerUID = uuid();
        
        this.listeners = {};
        
        // GAME PROPERTIES
        this.status = Room.STATUS.WAITING; // wait owner to start
        this.players = new Players();
        
        this.rounds = 0;
        // this.roundTime = 30; // make it a option on frontend
        this.roundTime = 10;
        this.roundPrepare = 5; // make it a option on frontend
        // this.roundsMax = 10; // make it a option on frontend
        this.roundsMax = 3;

        // songs
        this.musics = songs; // has 10 here - use maxRounds to get the right amount
        this.music = undefined; // selects on prepareRound
        this.musicDetails = undefined;
        
        // timer
        this.timer = undefined;

        this.messageEventEmitter = new EventEmitter();

        // todo: don't allow clients to connect if status is not 'waiting';
        // todo: kicked players (don't allow back in);
    }

    protected _handleMessage(message: any, player: Player) {
        const type: string = message.type as string;
        const body: any = message.body;
        
        try {
            this.messageEventEmitter.emit(type, body, player);
        } catch (error) {
            console.error(`type: ['${type}'] throwed an error:\n`, error);
        }
    }

    public get hasPassword() {
        return this.password !== undefined && this.password !== null;
    }

    /**
     * This will return data that is available to the public.
     */
    public get public() {
        return {
            id: this.id,
            name: this.name,
            size: this.players.size,
            passwordRequired: this.hasPassword,
            particular: this.particular,
        };
    }
    
    /**
     * This will return data that is available to people that joined the room.
     */
    public get private() {
        return {
            id: this.id,
            name: this.name,
            players: this.players.sanitized,
        };
    }

    protected _parse(e: WebSocket.MessageEvent) {
        return JSON.parse(e.data.toString());
    }
}

export default class RoomStandard extends Room {

    constructor(id: string, config: RoomConfig, songs: Song[]) {
        super(id, config, songs);
        this.setupMessageEventEmitter();
        this.timerCallback = this._prepareRound;
    }

    private setupMessageEventEmitter(): void {
        this.messageEventEmitter.once("start", (body) => {
            const isOwner = body.owner === this.ownerUID;

            if (!isOwner) {
                return;
            }

            if (this.status !== Room.STATUS.WAITING) {
                return;
            }

            this._prepareRound();
        });

        this.messageEventEmitter.on("kick", (body) => {
            const isOwner = body.owner === this.ownerUID;

            if (!isOwner) {
                return;
            }

            this.removePlayer(
                body.id,
                3000,
                "You got kicked from the room.",
                true
            );
        });

        this.messageEventEmitter.on("chat", (body, player: Player) => {
            this.broadcast({
                type: "chat",
                body: { text: body.text, nickname: player.nickname }
            });
        });

        this.messageEventEmitter.on("submit", (body, player: Player) => {
            if (this.music === undefined) return;
            
            const title_id = body.title.id;
            const pending = this.players.withStatus(Player.STATUS.PENDING);
            
            const ratio = pending.length / this.players.size;
            let status = this.music.title_id === title_id ? Player.STATUS.CORRECT : Player.STATUS.WRONG;
            let points = status === Player.STATUS.CORRECT ? Math.floor(player.points + 15 * ratio) : player.points;
            
            // the player class emits a onchange event and broadcasts to all
            player.set(points, status);
        });
    }

    private _randomMusic(): Song {
        const rnd = intFromInterval(0, this.musics.length - 1);
        const music = this.musics[rnd];
        
        this.musicDetails = {
            hash: makeid(9),
            partialPath: music.partialPath
        };
        this.musics = this.musics.filter((_, idx) => idx !== rnd);

        console.log(`[Room/${this.id}] Hash: ${this.musicDetails.hash} / Selected song:`, music.name);
        
        return music;
    }

    private _clearTimer(): void {
        if (this.timer === null) {
            return;
        }

        clearTimeout(this.timer);
    }

    private _startTimer(seconds: number): void {
        this.timer = setTimeout(this.timerCallback, 1000 * seconds);
    }

    private _prepareRound(): void {
        if (this.rounds === this.roundsMax) {
            this._endGame();
            return;
        }
    
        this.rounds += 1;
        this.status = Room.STATUS.PREPARING;
        this.music = this._randomMusic();
        
        const start_at = intFromInterval(5, this.music.duration - 30);
        const prepare = {
            type: "prepare",
            body: {
                room_status: this.status,
                round: this.rounds,
                music_hash: this.musicDetails!.hash,
                start_at,
            }
        };

        this.broadcast(prepare);
        this.timerCallback = this._startRound.bind(this);
        this._startTimer(this.roundPrepare);
    }

    private _startRound(): void {
        this.players.forEach(ply => {
            ply.status = Player.STATUS.PENDING;
        });

        this.status = Room.STATUS.STARTED;

        const round = {
            type: "round",
            body: {
                room_status: this.status,
                players: this.players.sanitized
            }
        };

        this.broadcast(round);
        this.timerCallback = this._prepareRound.bind(this);
        this._startTimer(this.roundTime);
    }

    private _endGame(): void {
        const winners = this.players.sanitized
            .sort((v1, v2) => v2.points - v1.points)
            .slice(0, 3);

        this.status = Room.STATUS.ENDED;
        
        const end = {
            type: "end",
            body: {
                winners,
                room_status: this.status,
            }
        };

        this.broadcast(end);
    }    

    public addPlayer(player: Player) {
        player.ws.on("close", () => {
            console.log(`[Room/${this.id}] ${player.id}/${player.nickname} exited the room`);
            
            if (this.players.has(player.id)) {
                this.removePlayer(player.id);
            }
        });

        player.ws.onmessage = (e: WebSocket.MessageEvent) => {
            const message = this._parse(e);
            this._handleMessage(message, player);
        }

        player.onchange = (e: PlayerChangeEvent) => {
            // broadcast changes to all;
            this.broadcast({ type: "change", body: e });
        };

        this.players.set(player.id, player);

        const you = {
            type: "yourid",
            body: { id: player.id }
        };

        const players = {
            type: "players",
            body: this.players.sanitized,
        };

        const timer = {
            type: "timer",
            body: {
                timerDuration: this.roundTime,
                prepareDuration: this.roundPrepare,
            }
        }

        // sends to player who's joined all the players
        // this.send(players, player);
        
        // send id to the player
        this.send(you, player);
        this.send(timer, player);
        
        // sends to all players the person who's joined
        this.broadcast(players);
    }

    broadcast(object: any, ignore: Player | undefined = undefined): void {
        if (!object) {
            return;
        }

        for (const [id, player] of this.players) {
            if (ignore !== undefined) {
                if (ignore.id === player.id) {
                    continue;
                }
            }

            if (player.ws.readyState === player.ws.OPEN) {
                player.send(object);
            }
        }
    }

    send(object: any, player: Player): void {
        if (!object || !player) {
            return;
        }

        player.send(object);
    }

    removePlayer(id: number,
                code: number | undefined = undefined,
                reason: string | undefined = undefined,
                kicked = false) {
        const player = this.players.get(id);
        player && player.closeWebSocket(code, reason);

        this.players.delete(id);

        if (this.players.size === 0 && typeof this.listeners["empty"] === 'function') {
            // emits empty and then the cluster deletes the room
            this._clearTimer();
            this.emit("empty", this.id);
        } else {
            const message = {
                type: "exited",
                body: {
                    id,
                    kicked
                }
            };

            this.broadcast(message);
        }
    }

    set onempty(value: () => void) {
        this.addEventListener("empty", value);
    }

    emit(method: string, payload: any = null) {
        const callback = this.listeners[method];
        if (typeof callback === 'function') {
            callback(payload);
        }
    }

    addEventListener(method: string, callback: Function) {
        this.listeners[method] = callback;
    }

    removeEventListener(method: string) {
        delete this.listeners[method];
    }
}