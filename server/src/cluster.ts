import http from 'http';
import {WebSocket, WebSocketServer, RawData} from 'ws';
import Room, { RoomConfig } from './room';
import Player from './player';
import { intFromInterval } from './utils';
import { ILogger } from './logger';
import Song from './models/song.model';
import { RedisClientType, createClient } from 'redis';
import RoomStandard from './room';

const generateRoomCode = () => {
    let initialCode = "";
    let finalCode = "";
    
    for (let i = 0; i < 3; i++) {
        initialCode += String.fromCharCode(intFromInterval(65, 90));
    }

    for (let i = 0; i < 5; i++) {
        finalCode += String.fromCharCode(intFromInterval(48, 57));
    }

    return initialCode + finalCode;
}

export default class RoomsCluster {

    private static _instance: RoomsCluster;
    private logger?: ILogger;
    private wss: WebSocketServer;
    private rooms: Map<string, Room>;
    // private client: RedisClientType;

    constructor(server: http.Server, port: number) {
        if (RoomsCluster._instance) {
            return RoomsCluster._instance;
        }

        RoomsCluster._instance = this;

        this.rooms = new Map();
        
        this.wss = new WebSocketServer({
            server: server,
            path: "/socket",
        });
        this.wss.on('connection', ws => {
            this._setupClient(ws);
        });
    }

    createRoom(config: RoomConfig, musics: Song[]) {
        const id = generateRoomCode();
        const room = new RoomStandard(id, config, musics);
        
        // timer
        const timerDeleteRoom = () => {
            if (!this.rooms.has(id)) return;
            if (room.players.size !== 0) return;
            
            if (this.deleteRoom(room.id)) {
                this.logger?.log("Deleted room:", id, "due to inactivity");
            } else {
                this.logger?.log("Hasn't able to delete room with timer:", id);
            }
        }
        
        const timer = setTimeout(timerDeleteRoom, 60 * 1000);

        room.onempty = () => {
            if (this.deleteRoom(id)) {
                this.logger?.log("Deleted room:", id);
            } else {
                this.logger?.log("Hasn't able to delete room:", id);
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

        // if (count > this.rooms.size) count -= (count - this.rooms.size) + start + 1; 

        const rooms = Array.from(this.rooms.values());
        for (let i = start; i < count; i++) {
            if (typeof rooms[i] !== 'undefined') {
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
            .filter(r => r.name.toLowerCase().includes(nameLowerCase));

        return roomsFound.map(r => r.public);;
    }

    deleteRoom(id: string) {
        return this.rooms.delete(id);
    }

    private _setupClient(ws: WebSocket): void {
        const _onMessage = (data: RawData) => {
            const message = JSON.parse(data.toString());
            this.logger?.debug(message);

            // only accept a joined type message upon joining
            const body = message.body;
            if (message.type !== "joined") {
                this.logger?.debug("[Cluster] Closing WebSocket client connection, type didn't match");
                ws.close();
                return;
            }

            const room = this.getRoom(body.room_id);
            if (room === undefined) {
                const notFound = {
                    type: "error",
                    statusCode: 404,
                    message: `Room ${body.room_id} not found`
                };

                ws.close(3404, JSON.stringify(notFound));
                return;
            }

            const id = room.players.size;
            const player = new Player(ws, id, body.nickname, 0, Player.STATUS.PENDING, body.avatar);
            
            // addPlayer handles the rest;
            room.addPlayer(player);
        };

        ws.once('message', _onMessage);
    }
}