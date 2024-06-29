import WebSocket from "ws";
import Song from "./models/song.model";
import Player, { PlayerChangeEvent, PlayerStatus, Players } from "./player";
import { intFromInterval, makeid, wait } from './utils';
import { v4 as uuid } from 'uuid';
import EventEmitter from "events";
import SongsService from "./services/songs.service";

export interface RoomConfig {
    name: string;
    password?: string;
    particular: boolean;
}

export interface MusicDetails {
    hash: string;
    partialPath: string;
}

enum MessageType {
    START = "start",
    KICK = "kick",
    CHAT = "chat",
    SUBMIT = "submit"
}

export enum RoomStatus {
    WAITING = 'waiting',
    PREPARING = 'preparing',
    STARTED = 'started',
    ROUND_ENDED = "round_ended",
    ENDED = 'ended'
}

abstract class Room {
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
    public roundEnd: number;
    public roundPrepare: number;
    public roundsMax: number;

    public service: SongsService;
    public musics: Song[];
    public music?: Song;
    public musicDetails?: MusicDetails;

    // public timer?: NodeJS.Timeout;
    // public timerCallback: () => void;

    constructor(id: string, config: RoomConfig) {
        this.id = id;
        this.name = config.name;
        this.particular = config.particular;
        this.password = config.password;
        this.ownerUID = uuid();
        
        this.listeners = {};
        
        // GAME PROPERTIES
        this.status = RoomStatus.WAITING; // wait owner to start
        this.players = new Players();
        
        this.rounds = 0;
        this.roundTime = 20; // make it a option on frontend
        this.roundEnd = 10;
        // this.roundTime = 10;
        this.roundPrepare = 5; // make it a option on frontend
        this.roundsMax = 10; // make it a option on frontend
        // this.roundsMax = 3;

        // songs
        this.service = new SongsService();
        this.musics = []; // has 10 here - use maxRounds to get the right amount
        this.music = undefined; // selects on prepareRound
        this.musicDetails = undefined;
        
        // timer
        // this.timer = undefined;

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
    private _cancel: boolean;

    private constructor(id: string, config: RoomConfig) {
        super(id, config);
        this._cancel = false;
        this.setupMessageEventEmitter();
    }

    public static async create(id: string, config: RoomConfig): Promise<RoomStandard> {
        const room = new RoomStandard(id, config);
        room.musics = await room.service.random(10);
        return room;
    }

    private async _restart() {
        this._cancel = false;
        this.rounds = 0;
        this.musics = await this.service.random(10);
    }

    private async _prepare() {
        // this._updateMusicStats();
        
        this.rounds += 1;
        this.music = this._randomMusic();
        
        const start_at = intFromInterval(5, this.music.duration - 30);
        const prepare = {
            type: "prepare",
            body: {
                room_status: this.status,
                round: this.rounds,
                roundMax: this.roundsMax,
                musicHash: this.musicDetails!.hash,
                startAt: start_at,
            }
        };

        this.broadcast(prepare);
        await wait(this.roundPrepare * 1000);
        this.status = RoomStatus.STARTED;
    }

    private async _round() {
        this.players.forEach(ply => {
            ply.status = Player.STATUS.PENDING;
        });

        const round = {
            type: "round",
            body: {
                room_status: this.status,
                players: this.players.sanitized
            }
        };

        this.broadcast(round);
        await wait(this.roundTime * 1000);
        this.status = RoomStatus.ROUND_ENDED;
    }

    private async _roundEnd() {
        const result = {
            type: 'round_result',
            body: {
                room_status: this.status,
                title: this.music?.title_name,
            }
        }

        this.broadcast(result);
        await wait(this.roundEnd * 1000);
        this.status = RoomStatus.PREPARING;
    }

    private _end(): void {
        this.status = RoomStatus.ENDED;
        
        const winners = this.players.sanitized
            .sort((v1, v2) => v2.points - v1.points)
            .slice(0, 3);
        
        const end = {
            type: "end",
            body: {
                winners: {
                    first: winners[0],
                    second: winners[1],
                    third: winners[2]
                },
                room_status: this.status,
            }
        };

        this.broadcast(end);
    }

    private _ensureOwner(owner: string): boolean {
        return owner === this.ownerUID;
    }

    private async _start(): Promise<void> {
        this.status = RoomStatus.PREPARING;

        while (!this._cancel) {
            if (this.rounds === this.roundsMax) {
                this._end();
                break;
            }

            switch (this.status) {
                case RoomStatus.PREPARING:
                    await this._prepare();
                break;
                    
                case RoomStatus.STARTED:
                    await this._round();
                break;
                    
                    
                case RoomStatus.ROUND_ENDED:
                    await this._roundEnd();
                break;
            }
        }

        this.status = RoomStatus.WAITING;
        await this._restart();
    }

    private setupMessageEventEmitter(): void {
        this.messageEventEmitter.on("start", (body) => {
            if (this.status !== RoomStatus.WAITING) {
                return;
            }
            
            if (!this._ensureOwner(body.owner)) {
                return;
            }

            this._start();
        });

        this.messageEventEmitter.on("kick", (body) => {
            if (!this._ensureOwner(body.owner)) {
                return;
            }

            this.removePlayer(
                body.id,
                3000,
                "You got kicked from the room",
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
            if (typeof this.music === 'undefined') return;
            
            const title_id = body.title.id;
            const pending = this.players.withStatus(Player.STATUS.PENDING);
            
            const ratio = pending.length / this.players.size;
            let status = this.music.title_id === title_id ? Player.STATUS.CORRECT : Player.STATUS.WRONG;
            let points = status === Player.STATUS.CORRECT ? Math.floor(player.points + 30 * ratio) : player.points;
            
            if (status === PlayerStatus.CORRECT) {
                this.music.correct! += 1;
            } else if (status === PlayerStatus.WRONG) {
                this.music.misses! += 1;
            }

            // the player class emits a onchange event and broadcasts to all
            player.set(points, status);
        });
    }

    private async _updateMusicStats() {
        if (typeof this.music === 'undefined') return;

        const result = await this.service.update(this.music.id!, {
            correct: this.music.correct,
            misses: this.music.misses
        });

        console.assert(result, "Not able to update C/M of " + this.music.name);
        console.log(`[Room/${this.id}] ${this.music.name} - C/M: [${this.music.correct}/${this.music.misses}]`)
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

        const details = {
            type: "details",
            body: {
                id: player.id,
                timerDuration: this.roundTime,
                endDuration: this.roundEnd,
                prepareDuration: this.roundPrepare,
            }
        };

        const players = {
            type: "players",
            body: this.players.sanitized,
        };

        // sends to player who's joined all the players
        // this.send(players, player);
        
        // send id to the player
        this.send(details, player);
        
        // sends to all players the person who's joined
        this.broadcast(players);
    }

    broadcast(object: any, ignore: Player | undefined = undefined): void {
        if (typeof object === 'undefined') {
            return;
        }

        for (const [id, player] of this.players) {
            if (typeof ignore !== 'undefined') {
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

    removePlayer(id: string,
                code: number | undefined = undefined,
                reason: string | undefined = undefined,
                kicked = false) {
        const player = this.players.get(id);
        player && player.closeWebSocket(code, reason);

        this.players.delete(id);

        if (this.players.size === 0 && typeof this.listeners["empty"] === 'function') {
            // emits empty and then the cluster deletes the room
            // this._clearTimer();

            this._cancel = true;
            this.status = RoomStatus.ENDED;
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