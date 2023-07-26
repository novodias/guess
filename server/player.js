const webSocket = require('ws');

// function player(ws, id, room_id, nickname, points, status) {
//     // id, room_id, ws, nickname, points, status,
//     const player = {
//         ws, id, room_id, nickname,
//         points, status,
//         setPoints(value) {
//             this.points = value;
//         },
//         setStatus(value) {
//             this.status = value;
//         },
//         closeWebSocket() {
//             this.ws.close();
//         }
//     }
//     return player;
// }

class Player {

    /**
     * 
     * @param {webSocket.WebSocket} ws 
     * @param {Number} id 
     * @param {String} room_id 
     * @param {String} nickname 
     * @param {Number} points 
     * @param {Number} status 
     */
    constructor(ws, id, room_id, nickname, points, status) {
        this.ws = ws;
        this.id = id;
        this.room_id = room_id;
        this.nickname = nickname;
        this.points = points;
        this.status = status;
    }

    closeWebSocket() {
        this.ws.close();
    }

    getPlayerData() {
        return {
            id: this.id,
            room_id: this.room_id,
            nickname: this.nickname,
            points: this.points,
            status: this.status
        };
    }

    send(object) {
        this.ws.send(JSON.stringify(object));
    }
}

module.exports = Player;