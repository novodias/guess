"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Players = exports.PlayerStatus = void 0;
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus[PlayerStatus["PENDING"] = 0] = "PENDING";
    PlayerStatus[PlayerStatus["CORRECT"] = 1] = "CORRECT";
    PlayerStatus[PlayerStatus["WRONG"] = 2] = "WRONG";
})(PlayerStatus || (exports.PlayerStatus = PlayerStatus = {}));
class Player {
    constructor(ws, id, nickname, points, status, avatar) {
        this.ws = ws;
        this.id = id;
        this.nickname = nickname;
        this.points = points;
        this.status = status;
        this.avatar = avatar;
        this.listeners = {};
    }
    closeWebSocket(code, reason) {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.close(code, reason);
        }
    }
    get data() {
        return {
            id: this.id,
            nickname: this.nickname,
            points: this.points,
            status: this.status,
            avatar: this.avatar
        };
    }
    setPoints(points) {
        this.points = points;
        const playerChangeEvent = {
            id: this.id,
            points: this.points,
        };
        this.emit("onchange", playerChangeEvent);
    }
    setStatus(status) {
        this.status = status;
        const playerChangeEvent = {
            id: this.id,
            status: this.status,
        };
        this.emit("onchange", playerChangeEvent);
    }
    set(points, status) {
        this.points = points;
        this.status = status;
        const playerChangeEvent = {
            id: this.id,
            points: this.points,
            status: this.status,
        };
        this.emit("onchange", playerChangeEvent);
    }
    set onchange(value) {
        this.addEventListener("onchange", value);
    }
    send(object) {
        this.ws.send(JSON.stringify(object));
    }
    emit(method, payload) {
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
Player.STATUS = Object.freeze(PlayerStatus);
exports.default = Player;
class Players extends Map {
    get _players() {
        return this.values();
    }
    get sanitized() {
        return Array.from(this._players)
            .map(player => player.data);
    }
    withStatus(status) {
        return Array.from(this._players)
            .filter(player => player.status === status);
    }
}
exports.Players = Players;
