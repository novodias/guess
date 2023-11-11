import WebSocket from "ws";
import Song from "./models/song";
import { Player } from "./player";
import { intFromInterval, makeid } from './utils';
import uuid from 'uuid';

export interface RoomConfig {
    name: string;
    password?: string;
    private: boolean;
}

export interface MusicDetails {
    hash: string;
    partialPath: string;
}

export interface RoomOwnerDetails {
    id: string;
    name: string;
    private: boolean;
    ownerUID: string;
}

interface MessageHandler {
    start(): void;
    kick(): void;
    submit(): void;
    chat(): void;
    joined(): void;
}

export default class Room {

    static STATUS = Object.freeze({
        WAITING: 'waiting',
        PREPARING: 'preparing',
        STARTED: 'started',
        ENDED: 'ended'
    });

    public id: string;
    public name: string;
    public particular: boolean;
    public password?: string;
    public ownerUID: string;

    private listeners: any;

    public status: string;
    public players: Map<number, Player>;
    public rounds: number;
    public roundTime: number;
    public roundPrepare: number;
    public roundsMax: number;

    public musics: Song[];
    public music?: Song;
    public musicDetails?: MusicDetails;

    public timer?: NodeJS.Timeout;
    public timerCallback: any;

    constructor(id: string, config: RoomConfig, songs: Song[]) {
        this.id = id;
        this.name = config.name;
        this.particular = config.private;
        this.password = config.password;
        this.ownerUID = uuid.v4();
        
        this.listeners = {};
        
        // GAME PROPERTIES
        this.status = Room.STATUS.WAITING; // wait owner to start
        /**
         * @type {Map<Number, Player>}
         */
        this.players = new Map();
        
        this.rounds = 0;
        this.roundTime = 30; // make it a option on frontend
        this.roundPrepare = 5; // make it a option on frontend
        this.roundsMax = 10; // make it a option on frontend

        // songs
        this.musics = songs; // has 10 here - use maxRounds to get the right amount
        this.music = undefined; // selects on prepareRound
        this.musicDetails = undefined;
        
        // timer
        this.timer = undefined;
        this.timerCallback = this._prepareRound;

        // todo: don't allow clients to connect if status is not 'waiting';
        // todo: kicked players (don't allow back in);
    }

    private _selectRandomSong(): void {
        const rnd = intFromInterval(0, this.musics.length - 1);
        
        this.music = this.musics[rnd];
        this.musicDetails = {
            hash: makeid(9),
            partialPath: this.music.partialPath
        };

        this.musics = this.musics.filter((_, idx) => idx !== rnd);
        console.log(`[Room/${this.id}] Hash: ${this.musicDetails.hash} / Selected song:`, this.music.name);
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
        this._selectRandomSong();
        const start_at = intFromInterval(5, this.music!.duration - 30);

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

        // roundPrepare default = 5
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
                players: this.getPlayers()
            }
        };

        this.broadcast(round);
        this.timerCallback = this._prepareRound.bind(this);

        // roundTime default = 30
        this._startTimer(this.roundTime);
    }

    private _endGame(): void {
        const winner = this.getPlayers()
            .sort((v1, v2) => v2.points - v1.points)[0];

        this.status = Room.STATUS.ENDED;
        
        const end = {
            type: "end",
            body: {
                winner,
                room_status: this.status,
            }
        };

        this.broadcast(end);
    }

    public getSize(): number {
        return this.players.size;
    }

    /**
     * 
     * @returns {Array<{id, nickname, points, status}>}
     */
    public getPlayers() {
        return Array
            .from(this.players)
            .map(([id, player]) => {
                return player.data;
            });
    }

    /**
     * @param {Number} status 
     * @returns {Array<Player>}
     */
    private _getPlayersByStatus(status: number) {
        return Array
            .from(this.players)
            .filter(([id, player]) => {
                return player.status === status
            });
    }

    public get hasPassword() {
        return this.password !== undefined;
    }

    /**
     * This will return data that is available to the public.
     */
    public get public() {
        return {
            id: this.id,
            name: this.name,
            passwordRequired: this.hasPassword,
            isPrivate: this.particular,
        };
    }
    
    /**
     * This will return data that is available to people that joined the room.
     */
    get private() {
        return {
            id: this.id,
            name: this.name,
            players: this.getPlayers(),
        };
    }

    private _getPlayer(id: number) {
        return this.players.get(id);
    }

    _handleMessage(message: any, player: Player) {
        const type: string = message.type;
        const body: any = message.body;
        // console.log(message);
        
        const handler: MessageHandler = {
            "start": () => {
                const isOwner = body.owner === this.ownerUID;

                if (!isOwner) {
                    return;
                }

                if (this.status !== Room.STATUS.WAITING) {
                    return;
                }

                this._prepareRound();
            },

            "kick": () => {
                const isOwner = body.owner === this.ownerUID;

                if (!isOwner) {
                    return;
                }

                // console.log("kick:", body);
                this.removePlayer(body.id, 3000, "You got kicked from the room.", true);
            },

            "submit": () => {
                const id = body.id;
                const title_id = body.title.id;
                const pending = this._getPlayersByStatus(Player.STATUS.PENDING);

                // if player its not with status pending, ignore
                // if (!pending.find(p => p.id === id)) {
                //     return;
                // }

                const player = this.players.get(id);

                if (player === undefined) {
                    return;
                }

                const ratio = pending.length / this.players.size;
                let status = this.music!.title_id === title_id ? Player.STATUS.CORRECT : Player.STATUS.WRONG;
                let points = status === Player.STATUS.CORRECT ? Math.floor(player.points + 15 * ratio) : player.points;
                
                // the player class emits a onchange event and broadcasts to all
                player.set(points, status);

                // if pending is 1, that means it is the last that just submitted - prepare new round
                // disable this for now.
                // if (pending.length === 1) {
                //     this._clearTimer();
                //     this._prepareRound();
                // }
            },

            // self explanatory
            "chat": () => {
                this.broadcast({
                    type: "chat",
                    body: { text: body.text, nickname: player.nickname }
                });
            },

            "joined": () => {
                console.log("Someone tried to join");
            }
        }

        try {
            handler[type as keyof MessageHandler]();
        } catch (error) {
            console.error(`type: ['${type}'] throwed an error:\n`, error);
        }
    }

    private _parse(e: WebSocket.MessageEvent) {
        return JSON.parse(e.data.toString());
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

        player.onchange((body: any) => {
            // broadcast changes to all;
            // console.log('onchange:', body);
            this.broadcast({ type: "change", body });
        })

        this.players.set(player.id, player);

        // const joined = {
        //     type: "joined",
        //     body: player.getPlayerData(),
        // };

        const you = {
            type: "yourid",
            body: { id: player.id }
        };

        const players = {
            type: "players",
            body: this.getPlayers(),
        };

        // sends to player who's joined all the players
        // this.send(players, player);
        
        // send id to the player
        this.send(you, player);
        
        // sends to all players the person who's joined
        this.broadcast(players);
    }

    
    /**
     * 
     * @param {any} object 
     * @param {Player} ignore 
     */
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

            if (!(player instanceof Player)) {
                continue;
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
        const player = this._getPlayer(id);
        player && player.closeWebSocket(code, reason);

        this.players.delete(id);

        const size = this.getSize();
        if (size === 0 && typeof this.listeners["empty"] === 'function') {
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

    onempty(callback: Function) {
        this.addEventListener("empty", callback);
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