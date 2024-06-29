"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const room_1 = __importDefault(require("./room"));
const player_1 = __importDefault(require("./player"));
const utils_1 = require("./utils");
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
    constructor(server, port) {
        if (RoomsCluster._instance) {
            return RoomsCluster._instance;
        }
        RoomsCluster._instance = this;
        this.logger = null;
        this.wss = new ws_1.WebSocketServer({
            server: server,
            path: "/socket",
        });
        this.rooms = new Map();
        this._addEvents();
    }
    createRoom(config, musics) {
        const id = generateRoomCode();
        const room = new room_1.default(id, config, musics);
        room.onempty((id) => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.log(`Deleted room: ${id}`);
            this.deleteRoom(id);
            // room = null;
        });
        this.rooms.set(id, room);
        // timer
        // const timerDeleteRoom = (time) => {
        //     const tRoom = this.getRoom(id);
        //     if (tRoom === undefined) {
        //         return;
        //     }
        //     if (tRoom.getSize() === 0) {
        //         this.deleteRoom(tRoom.id);
        //         console.log(`[Rooms] Deleted room ${tRoom.id} due to inactivity`);
        //     } else {
        //         setTimeout(timerDeleteRoom, time);
        //         console.log(`[Rooms] Setting timer to room ${tRoom.id} in case of inactivity`);
        //     }
        // }
        // setTimeout(timerDeleteRoom, 5 * 60 * 1000);
        return {
            id,
            ownerUID: room.ownerUID
        };
    }
    getRoom(id) {
        return this.rooms.get(id);
    }
    deleteRoom(id) {
        this.rooms.delete(id);
    }
    _setupClient(ws) {
        // Doesn't look pretty, but it works,
        // this allows to do the message event inside the room
        // Prevents adding room_id to the body for every message
        // Makes more easy to do stuff inside the room
        // which is where the stuff is happening.
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
            const player = new player_1.default(ws, id, body.nickname, 0, player_1.default.STATUS.PENDING);
            // remove the callback here
            ws.emit('remove', ws);
            // addPlayer handles the rest;
            room.addPlayer(player);
        };
        ws.on('remove', ws => {
            var _a;
            ws.off('message', _onMessage);
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug("[Cluster] Player joined, removed event message");
        });
        ws.on('message', _onMessage);
    }
    _addEvents() {
        this.wss.on('connection', ws => {
            this._setupClient(ws);
        });
    }
}
exports.default = RoomsCluster;
