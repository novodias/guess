const webSocket = require('ws');
const http = require('http');
const Room = require('./room');
const Player = require('./player');
const { GuessDb } = require('./db');

// const _messageHandler = {
//     /**
//      * 
//      * @param {RoomsCluster} cluster 
//      * @param {webSocket.WebSocket} ws 
//      * @param {*} body 
//      * @returns 
//      */
//     "joined": function (cluster, ws, body) {
//         const room = cluster.getRoom(body.room_id)
    
//         if (room === undefined) {
//             // const notFound = {
//             //     type: "error",
//             //     statusCode: 404,
//             //     message: "Room not found"
//             // };

//             ws.close();
//             return;
//         }

//         const id = room.getSize();
//         const player = new Player(ws, id, room.id, body.nickname, 0, 0);
//         room.addPlayer(player);
//     },

//     // client exited
//     // "exited": function (cluster, ws, body) {
//     // },

//     "generic": function (cluster, ws, body) {

//     }
// }

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

    // stringify(object) {
    //     return JSON.stringify(object);
    // }

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
            console.log(message);

            // only accept a joined type message upon joining
            const body = message.body;
            if (message.type !== "joined") {
                console.log("[Cluster] Closing WebSocket client connection, type didn't match");
                ws.close();
                return;
            }

            const room = this.getRoom(body.room_id);
            if (room === undefined) {
                // const notFound = {
                //     type: "error",
                //     statusCode: 404,
                //     message: "Room not found"
                // };

                ws.close();
                return;
            }

            const id = room.getSize();
            const player = new Player(ws, id, room.id, body.nickname, 0, 0);

            // remove the callback here
            ws.emit('remove', ws);
            
            // addPlayer handles the rest;
            room.addPlayer(player);
        };

        ws.on('remove', ws => {
            ws.off('message', _onMessage);
            console.log("[Cluster] Player joined, removed event message");
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