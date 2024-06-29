import http from 'http';
import { WebSocket, WebSocketServer, RawData } from 'ws';
import Room, { RoomConfig, RoomStatus } from './room';
import Player from './player';
import { intFromInterval } from './utils';
import { ILogger, loggerFactory } from './logger';
import RoomStandard from './room';

const randomRoomCode = () => {
    let code = "";
    const randomChar = (n1: number, n2: number) => String.fromCharCode(intFromInterval(n1, n2));

    for (let i = 0; i < 8; i++) {
        code += i < 3 ? randomChar(65, 90) : randomChar(48, 57);
    }

    return code;
}

export default class RoomsCluster {

    private static _instance: RoomsCluster;
    private logger?: ILogger;
    private wss: WebSocketServer;
    private rooms: Map<string, Room>;

    constructor(server: http.Server) {
        if (RoomsCluster._instance) {
            return RoomsCluster._instance;
        }

        RoomsCluster._instance = this;
        this.logger = loggerFactory("Cluster");

        this.rooms = new Map();
        
        this.wss = new WebSocketServer({
            server: server,
            path: "/socket",
        });

        this.wss.on('connection', ws => {
            this._setupClient(ws);
        });
    }

    async createRoom(config: RoomConfig) {
        const id = randomRoomCode();
        const room = await RoomStandard.create(id, config);
        
        // timer
        const timerDeleteRoom = () => {
            if (!this.rooms.has(id)) return;
            if (room.players.size !== 0) return;
            
            if (this.deleteRoom(room.id)) {
                this.logger?.log("Deleted room:", id, "due to inactivity");
            } else {
                this.logger?.log("Not able to delete room with timer:", id);
            }
        }
        
        const timer = setTimeout(timerDeleteRoom, 60 * 1000);

        room.onempty = () => {
            if (this.deleteRoom(id)) {
                this.logger?.log("Deleted room:", id);
            } else {
                this.logger?.log("Not able to delete room:", id);
            }

            clearTimeout(timer);
        }

        this.rooms.set(id, room);
        
        return {
            id,
            ownerUID: room.ownerUID
        };
    }

    getRoom(id: string) {
        return this.rooms.get(id);
    }

    getRooms(start: number, count: number) {
        if (start < 0) start = 0;
        
        let moreAvailable = true;
        const publicRooms: any[] = [];
        
        if (start > this.rooms.size - 1) {
            moreAvailable = false;
            return {
                rooms: publicRooms,
                more: moreAvailable
            };
        }

        const rooms = Array.from(this.rooms.values());
        for (let i = start; i < count; i++) {
            if (typeof rooms[i] !== 'undefined' &&
                rooms[i].status === RoomStatus.WAITING) {
                publicRooms.push(rooms[i].public);

                if (i === count - 1) {
                    if (typeof rooms[i + 1] === 'undefined') {
                        moreAvailable = false;
                    }
                }
            } else {
                moreAvailable = false;
                break;
            }
        }

        return {
            rooms: publicRooms,
            more: moreAvailable
        };
    }

    query(name: string) {
        const nameLowerCase = name.toLowerCase();
            
        const roomsFound = Array.from(this.rooms.values())
            .filter(r => r.name.toLowerCase().includes(nameLowerCase)
                && r.status === RoomStatus.WAITING);

        return roomsFound.map(r => r.public);
    }

    deleteRoom(id: string) {
        return this.rooms.delete(id);
    }

    wsError(ws: WebSocket, message: string, code: number = 3400) {
        ws.close(code, JSON.stringify({
            type: "error",
            message
        }));
    }

    private _setupClient(ws: WebSocket): void {
        const upgrade = (data: RawData) => {
            const message = JSON.parse(data.toString());
            this.logger?.debug(message);

            // only accept a joined type message upon joining
            const body = message.body;
            if (message.type !== "joined") {
                this.logger?.debug("[Cluster] Closing WebSocket client connection, type didn't match");
                this.wsError(ws, `Message type not accetable`);
                return;
            }

            const room = this.getRoom(body.room_id);
            if (typeof room === 'undefined') {
                this.wsError(ws, `Room ${body.room_id} not found`, 3404);
                return;
            }
            
            if (room.players.size === 15) {
                this.wsError(ws, `Room is already full`);
                return;
            }

            const player = new Player(ws, body.nickname, body.avatar);
            // addPlayer handles the rest;
            room.addPlayer(player);
        };

        ws.once('message', upgrade);
    }
}