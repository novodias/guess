const webSocket = require('ws');
const http = require('http');
const Room = require('./room');
const Player = require('./player');
const { GuessDb } = require('./db');

const _messageHandler = {
    /**
     * 
     * @param {RoomsCluster} cluster 
     * @param {webSocket.WebSocket} ws 
     * @param {*} body 
     * @returns 
     */
    "joined": function (cluster, ws, body) {
        const room = cluster.getRoom(body.room_id)
    
        if (!room) {
            const notFound = {
                type: "error",
                statusCode: 404,
                message: "Room not found"
            };

            ws.close("404", JSON.stringify(notFound));
            return;
        }

        const id = room.getSize();
        const player = new Player(ws, id, room.id, body.nickname, 0, 0);
        room.addPlayer(player);
    },

    // client exited
    // "exited": function (cluster, ws, body) {
    // },

    "generic": function (cluster, ws, body) {

    }
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const generateRoomCode = () => {
    let initialCode = "";
    let finalCode = "";
    
    for (let i = 0; i < 3; i++) {
        initialCode += String.fromCharCode(randomIntFromInterval(65, 90));
    }

    for (let i = 0; i < 5; i++) {
        finalCode += String.fromCharCode(randomIntFromInterval(48, 57));
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

        this.wss = new webSocket.Server({ server: server });
        this.rooms = new Map();
        this.db = db;
        this._addEvents();
        
        console.log(`[WebSocket] Listening on ${port}`);
    }

    /**
     * 
     * @param {String} name 
     * @param {String} passwordHash 
     * @param {Boolean} isPrivate 
     * @returns 
     */
    createRoom(name, passwordHash, isPrivate) {
        const id = generateRoomCode();
        const room = new Room(id, name, passwordHash, isPrivate);
        
        room.onempty(id => {
            console.log(`[Rooms] Deleted ${id}`);
            this.deleteRoom(id);
            // room = null;
        });

        this.rooms.set(id, room);

        // timer
        const timerDeleteRoom = (time) => {
            if (!room) {
                return;
            }
            if (room !== null && room.getSize() === 0) {
                this.deleteRoom(room.id);
                console.log(`[Rooms] Deleted room ${room.id} due to inactivity`);
            } else {
                console.log(`[Rooms] Setting timer to room ${room.id} in case of inactivity`);
                setTimeout(timerDeleteRoom, time);
            }
        }
        setTimeout(timerDeleteRoom, 5 * 60 * 1000);
        
        return id;
    }

    /**
     * 
     * @param {String} id 
     * @returns {Room}
     */
    getRoom(id) {
        return this.rooms.get(id);
    }

    deleteRoom(id) {
        this.rooms.delete(id);
    }

    stringify(object) {
        return JSON.stringify(object);
    }

    /**
     * 
     * @param {webSocket.WebSocket} ws 
     * @param {*} body 
     */
    _setupClient(ws) {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            console.log(message);
            _messageHandler[message.type](this, ws, message.body);
        })
    }

    _addEvents() {
        this.wss.on('connection', ws => {
            this._setupClient(ws);
        })
    }
}

module.exports = RoomsCluster;