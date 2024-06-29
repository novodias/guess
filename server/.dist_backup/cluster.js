"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const player_1 = __importDefault(require("./player"));
const utils_1 = require("./utils");
const room_1 = __importDefault(require("./room"));
const generateRoomCode = () => {
    let initialCode = "";
    let finalCode = "";
    for (let i = 0; i < 3; i++) {
        initialCode += String.fromCharCode((0, utils_1.intFromInterval)(65, 90));
    }
    for (let i = 0; i < 5; i++) {
        finalCode += String.fromCharCode((0, utils_1.intFromInterval)(48, 57));
    }
    return initialCode + finalCode;
};
class RoomsCluster {
    // private client: RedisClientType;
    constructor(server, port) {
        if (RoomsCluster._instance) {
            return RoomsCluster._instance;
        }
        RoomsCluster._instance = this;
        this.rooms = new Map();
        this.wss = new ws_1.WebSocketServer({
            server: server,
            path: "/socket",
        });
        this.wss.on('connection', ws => {
            this._setupClient(ws);
        });
    }
    createRoom(config, musics) {
        const id = generateRoomCode();
        const room = new room_1.default(id, config, musics);
        // timer
        const timerDeleteRoom = () => {
            var _a, _b;
            if (!this.rooms.has(id))
                return;
            if (room.players.size !== 0)
                return;
            if (this.deleteRoom(room.id)) {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.log("Deleted room:", id, "due to inactivity");
            }
            else {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.log("Hasn't able to delete room with timer:", id);
            }
        };
        const timer = setTimeout(timerDeleteRoom, 60 * 1000);
        room.onempty = () => {
            var _a, _b;
            if (this.deleteRoom(id)) {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.log("Deleted room:", id);
            }
            else {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.log("Hasn't able to delete room:", id);
            }
            clearTimeout(timer);
        };
        this.rooms.set(id, room);
        return {
            id,
            ownerUID: room.ownerUID
        };
    }
    getRoom(id) {
        return this.rooms.get(id);
    }
    getRooms(start, count) {
        if (start < 0)
            start = 0;
        let moreAvailable = true;
        const publicRooms = [];
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
            }
            else {
                moreAvailable = false;
                break;
            }
        }
        return {
            rooms: publicRooms,
            more: moreAvailable
        };
    }
    query(name) {
        const nameLowerCase = name.toLowerCase();
        const roomsFound = Array.from(this.rooms.values())
            .filter(r => r.name.toLowerCase().includes(nameLowerCase));
        return roomsFound.map(r => r.public);
        ;
    }
    deleteRoom(id) {
        return this.rooms.delete(id);
    }
    _setupClient(ws) {
        const _onMessage = (data) => {
            var _a, _b;
            const message = JSON.parse(data.toString());
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(message);
            // only accept a joined type message upon joining
            const body = message.body;
            if (message.type !== "joined") {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.debug("[Cluster] Closing WebSocket client connection, type didn't match");
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
            const player = new player_1.default(ws, id, body.nickname, 0, player_1.default.STATUS.PENDING, body.avatar);
            // addPlayer handles the rest;
            room.addPlayer(player);
        };
        ws.once('message', _onMessage);
    }
}
exports.default = RoomsCluster;
