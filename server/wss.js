const webSocket = require('ws');
const http = require('http');
const Room = require('./room');
const { Player } = require('./player');
const { GuessDb, Song } = require('./db');
const { intFromInterval, loggerFactory } = require('./utils');

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

class RoomsCluster {

    /**
     * 
     * @param {http.Server} server
     * @param {Number} port
     * @param {GuessDb} db 
     * @returns 
     */
    constructor(server, port, db) {
        if (RoomsCluster._instance) {
            return RoomsCluster._instance;
        }

        RoomsCluster._instance = this;

        this.logger = loggerFactory("WSServer");
        this.wss = new webSocket.Server({
            server: server,
            path: "/socket",
        });
        this.rooms = new Map();
        this.db = db;
        this._addEvents();
        
        this.logger.log(`Listening on ${port}`);
    }

    /**
     * 
     * @param {String} name 
     * @param {String} passwordHash 
     * @param {Boolean} isPrivate 
     * @param {Array<Song>} songs 
     * @returns {Room}
     */
    createRoom(name, passwordHash, isPrivate, songs) {
        const id = generateRoomCode();
        const room = new Room(id, name, passwordHash, isPrivate, songs);
        
        room.onempty(id => {
            this.logger.log(`Deleted room: ${id}`);
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
        
        return { id, name, isPrivate, ownerId: room.ownerId };
    }

    /**
     * 
     * @param {String} id 
     * @returns {Room | undefined}
     */
    getRoom(id) {
        return this.rooms.get(id);
    }

    deleteRoom(id) {
        this.rooms.delete(id);
    }

    /**
     * 
     * @param {webSocket.WebSocket} ws 
     * @param {*} body 
     */
    _setupClient(ws) {
        // Doesn't look pretty, but it works,
        // this allows to do the message event inside the room
        // Prevents adding room_id to the body for every message
        // Makes more easy to do stuff inside the room
        // which is where the stuff is happening.

        const _onMessage = (data) => {
            const message = JSON.parse(data.toString());
            this.logger.debug(message);
            

            // only accept a joined type message upon joining
            const body = message.body;
            if (message.type !== "joined") {
                this.logger.debug("[Cluster] Closing WebSocket client connection, type didn't match");
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

            const id = room.getSize();
            const player = new Player(ws, id, body.nickname, 0, Player.STATUS.PENDING);

            // remove the callback here
            ws.emit('remove', ws);
            
            // addPlayer handles the rest;
            room.addPlayer(player);
        };

        ws.on('remove', ws => {
            ws.off('message', _onMessage);
            this.logger.debug("[Cluster] Player joined, removed event message");
        });

        ws.on('message', _onMessage);
    }

    _addEvents() {
        this.wss.on('connection', ws => {
            this._setupClient(ws);
        });
    }
}

module.exports = RoomsCluster;