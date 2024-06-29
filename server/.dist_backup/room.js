"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = __importStar(require("./player"));
const utils_1 = require("./utils");
const uuid_1 = require("uuid");
const events_1 = __importDefault(require("events"));
// interface MessageRequestHandler {
//     [k: string]: () => void;
// }
// type MessageKey = keyof MessageRequestHandler;
class Room {
    constructor(id, config, songs) {
        this.id = id;
        this.name = config.name;
        this.particular = config.particular;
        this.password = config.password;
        this.ownerUID = (0, uuid_1.v4)();
        this.listeners = {};
        // GAME PROPERTIES
        this.status = Room.STATUS.WAITING; // wait owner to start
        this.players = new player_1.Players();
        this.rounds = 0;
        this.roundTime = 20; // make it a option on frontend
        this.roundEnd = 10;
        // this.roundTime = 10;
        this.roundPrepare = 5; // make it a option on frontend
        this.roundsMax = 10; // make it a option on frontend
        // this.roundsMax = 3;
        // songs
        this.musics = songs; // has 10 here - use maxRounds to get the right amount
        this.music = undefined; // selects on prepareRound
        this.musicDetails = undefined;
        // timer
        this.timer = undefined;
        this.messageEventEmitter = new events_1.default();
        // todo: don't allow clients to connect if status is not 'waiting';
        // todo: kicked players (don't allow back in);
    }
    _handleMessage(message, player) {
        const type = message.type;
        const body = message.body;
        try {
            this.messageEventEmitter.emit(type, body, player);
        }
        catch (error) {
            console.error(`type: ['${type}'] throwed an error:\n`, error);
        }
    }
    get hasPassword() {
        return this.password !== undefined && this.password !== null;
    }
    /**
     * This will return data that is available to the public.
     */
    get public() {
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
    get private() {
        return {
            id: this.id,
            name: this.name,
            players: this.players.sanitized,
        };
    }
    _parse(e) {
        return JSON.parse(e.data.toString());
    }
}
Room.STATUS = Object.freeze({
    WAITING: 'waiting',
    PREPARING: 'preparing',
    STARTED: 'started',
    ROUND_ENDED: "round_ended",
    ENDED: 'ended'
});
class RoomStandard extends Room {
    constructor(id, config, songs) {
        super(id, config, songs);
        this.setupMessageEventEmitter();
        this.timerCallback = this._prepareRound;
    }
    setupMessageEventEmitter() {
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
            this.removePlayer(body.id, 3000, "You got kicked from the room.", true);
        });
        this.messageEventEmitter.on("chat", (body, player) => {
            this.broadcast({
                type: "chat",
                body: { text: body.text, nickname: player.nickname }
            });
        });
        this.messageEventEmitter.on("submit", (body, player) => {
            if (this.music === undefined)
                return;
            const title_id = body.title.id;
            const pending = this.players.withStatus(player_1.default.STATUS.PENDING);
            const ratio = pending.length / this.players.size;
            let status = this.music.title_id === title_id ? player_1.default.STATUS.CORRECT : player_1.default.STATUS.WRONG;
            let points = status === player_1.default.STATUS.CORRECT ? Math.floor(player.points + 15 * ratio) : player.points;
            // the player class emits a onchange event and broadcasts to all
            player.set(points, status);
        });
    }
    _randomMusic() {
        const rnd = (0, utils_1.intFromInterval)(0, this.musics.length - 1);
        const music = this.musics[rnd];
        this.musicDetails = {
            hash: (0, utils_1.makeid)(9),
            partialPath: music.partialPath
        };
        this.musics = this.musics.filter((_, idx) => idx !== rnd);
        console.log(`[Room/${this.id}] Hash: ${this.musicDetails.hash} / Selected song:`, music.name);
        return music;
    }
    _clearTimer() {
        if (this.timer === null) {
            return;
        }
        clearTimeout(this.timer);
    }
    _startTimer(seconds) {
        this.timer = setTimeout(this.timerCallback, 1000 * seconds);
    }
    _prepareRound() {
        if (this.rounds === this.roundsMax) {
            this._endGame();
            return;
        }
        this.rounds += 1;
        this.status = Room.STATUS.PREPARING;
        this.music = this._randomMusic();
        const start_at = (0, utils_1.intFromInterval)(5, this.music.duration - 30);
        const prepare = {
            type: "prepare",
            body: {
                room_status: this.status,
                round: this.rounds,
                roundMax: this.roundsMax,
                music_hash: this.musicDetails.hash,
                start_at,
            }
        };
        this.broadcast(prepare);
        this.timerCallback = this._startRound.bind(this);
        this._startTimer(this.roundPrepare);
    }
    _endRound() {
        var _a;
        this.status = Room.STATUS.ROUND_ENDED;
        const result = {
            type: 'round_result',
            body: {
                room_status: this.status,
                title: (_a = this.music) === null || _a === void 0 ? void 0 : _a.title_name,
            }
        };
        this.broadcast(result);
        this.timerCallback = this._prepareRound.bind(this);
        this._startTimer(this.roundEnd);
    }
    _startRound() {
        this.players.forEach(ply => {
            ply.status = player_1.default.STATUS.PENDING;
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
        this.timerCallback = this._endRound.bind(this);
        this._startTimer(this.roundTime);
    }
    _endGame() {
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
    addPlayer(player) {
        player.ws.on("close", () => {
            console.log(`[Room/${this.id}] ${player.id}/${player.nickname} exited the room`);
            if (this.players.has(player.id)) {
                this.removePlayer(player.id);
            }
        });
        player.ws.onmessage = (e) => {
            const message = this._parse(e);
            this._handleMessage(message, player);
        };
        player.onchange = (e) => {
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
                endDuration: this.roundEnd,
                prepareDuration: this.roundPrepare,
            }
        };
        // sends to player who's joined all the players
        // this.send(players, player);
        // send id to the player
        this.send(you, player);
        this.send(timer, player);
        // sends to all players the person who's joined
        this.broadcast(players);
    }
    broadcast(object, ignore = undefined) {
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
    send(object, player) {
        if (!object || !player) {
            return;
        }
        player.send(object);
    }
    removePlayer(id, code = undefined, reason = undefined, kicked = false) {
        const player = this.players.get(id);
        player && player.closeWebSocket(code, reason);
        this.players.delete(id);
        if (this.players.size === 0 && typeof this.listeners["empty"] === 'function') {
            // emits empty and then the cluster deletes the room
            this._clearTimer();
            this.emit("empty", this.id);
        }
        else {
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
    set onempty(value) {
        this.addEventListener("empty", value);
    }
    emit(method, payload = null) {
        const callback = this.listeners[method];
        if (typeof callback === 'function') {
            callback(payload);
        }
    }
    addEventListener(method, callback) {
        this.listeners[method] = callback;
    }
    removeEventListener(method) {
        delete this.listeners[method];
    }
}
exports.default = RoomStandard;
