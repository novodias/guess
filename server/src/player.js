const webSocket = require('ws');

class Player {

    static STATUS = Object.freeze({
        PENDING: 0,
        CORRECT: 1,
        WRONG: 2,
    })

    /**
     * 
     * @param {webSocket.WebSocket} ws 
     * @param {Number} id 
     * @param {String} room_id 
     * @param {String} nickname 
     * @param {Number} points 
     * @param {Number} status 
     */
    constructor(ws, id, nickname, points, status) {
        this.ws = ws;
        this.id = id;
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
     * @returns {{id, nickname, points, status}}
     */
    get data() {
        return {
            id: this.id,
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

module.exports = { Player };