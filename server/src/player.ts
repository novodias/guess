import { WebSocket } from 'ws';

export enum PlayerStatus {
    PENDING = 0,
    CORRECT = 1,
    WRONG = 2
}

export interface PlayerChangeEvent {
    readonly id: number;
    readonly points?: number;
    readonly status?: PlayerStatus;
}

export type PlayerChangeCallback = (e: PlayerChangeEvent) => void;

export interface PlayerData {
    id: number;
    nickname: string;
    points: number;
    status: PlayerStatus;
    avatar: number;
}

export default class Player {

    public static STATUS = Object.freeze(PlayerStatus);

    public ws: WebSocket;
    public id: number;
    public nickname: string;
    public points: number;
    public status: PlayerStatus;
    public avatar: number;

    private listeners: any;

    constructor(ws: WebSocket, id: number, nickname: string, points: number, status: PlayerStatus, avatar: number) {
        this.ws = ws;
        this.id = id;
        this.nickname = nickname;
        this.points = points;
        this.status = status;
        this.avatar = avatar;

        this.listeners = {};
    }

    closeWebSocket(code: number | undefined, reason: string | undefined) {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.close(code, reason);
        }
    }

    public get data(): PlayerData {
        return {
            id: this.id,
            nickname: this.nickname,
            points: this.points,
            status: this.status,
            avatar: this.avatar
        };
    }

    setPoints(points: number) {
        this.points = points;
        
        const playerChangeEvent: PlayerChangeEvent = {
            id: this.id,
            points: this.points,
        }

        this.emit("onchange", playerChangeEvent);
    }

    setStatus(status: PlayerStatus) {
        this.status = status;
        
        const playerChangeEvent: PlayerChangeEvent = {
            id: this.id,
            status: this.status,
        }

        this.emit("onchange", playerChangeEvent);
    }

    set(points: number, status: PlayerStatus) {
        this.points = points;
        this.status = status;
        
        const playerChangeEvent: PlayerChangeEvent = {
            id: this.id,
            points: this.points,
            status: this.status,
        }

        this.emit("onchange", playerChangeEvent);
    }

    set onchange(value: PlayerChangeCallback) {
        this.addEventListener("onchange", value);
    }

    send(object: any) {
        this.ws.send(JSON.stringify(object));
    }

    emit(method: string, payload: any) {
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

export class Players extends Map<number, Player> {
    private get _players(): IterableIterator<Player> {
        return this.values();
    }
    
    public get sanitized(): PlayerData[] {
        return Array.from(this._players)
            .map(player => player.data);
    }

    public withStatus(status: PlayerStatus): Player[] {
        return Array.from(this._players)
            .filter(player => player.status === status);
    }
}