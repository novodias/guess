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

const PlayerStatus = Object.freeze({
    PENDING: 0,
    CORRECT: 1,
    WRONG: 2,
});

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

        this.listeners = {};
    }

    /**
     * 
     * @param {Number | undefined} code 
     * @param {String | undefined} reason 
     */
    closeWebSocket(code = undefined, reason = undefined) {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.close(code, reason);
        }
    }

    /**
     * 
     * @returns {{id, room_id, nickname, points, status}}
     */
    getPlayerData() {
        return {
            id: this.id,
            // room_id: this.room_id,
            nickname: this.nickname,
            points: this.points,
            status: this.status
        };
    }

    setPoints(points) {
        this.points = points;

        this.emit("onchange", { id: this.id, points: this.points });
    }

    setStatus(status) {
        this.status = status;

        this.emit("onchange", { id: this.id, status: this.status });
    }

    set(points, status) {
        this.points = points;
        this.status = status;

        this.emit("onchange", { id: this.id, points: this.points, status: this.status });
    }

    onchange(callback) {
        this.addEventListener("onchange", callback);
    }

    send(object) {
        this.ws.send(JSON.stringify(object));
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

module.exports = { Player, PlayerStatus };