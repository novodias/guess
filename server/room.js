const Player = require("./player");

class Room {

    /**
     * 
     * @param {String} id 
     */
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.listeners = {};
    }

    getSize() {
        return this.players.size;
    }

    getPlayers() {
        return Array
            .from(this.players)
            .map(([id, player]) => {
                return player.getPlayerData();
            });
    }

    getRoomData() {
        return {
            id: this.id,
            players: this.getPlayers(),
        };
    }

    /**
     * 
     * @param {Player} player 
     */
    addPlayer(player) {
        player.ws.on("close", ws => {
            this.removePlayer(player.id);
        });

        this.players.set(player.id, player);

        const joined = {
            type: "joined",
            body: player.getPlayerData(),
        };

        const players = {
            type: "players",
            body: this.getPlayers(),
        };

        // sends to player who's joined all the players
        // this.send(players, player);
        
        // sends to all players the person who's joined
        this.broadcast(players);
    }

    
    /**
     * 
     * @param {Object} object 
     * @param {*} ignore 
     */
    broadcast(object, ignore) {
        if (!object) {
            return;
        }

        // this.players.forEach(player => {
        //     if (!ignore || player.id !== ignore.id) {
        //         if (player instanceof Player) {
        //             player.send(object);
        //         }
        //     }
        // })

        for (const [id, player] of this.players) {
            if (ignore && player.id === ignore.id) {
                continue;
            }

            if (!(player instanceof Player)) {
                continue;
            }

            if (player.ws.readyState === player.ws.OPEN) {
                player.send(object);
            }
        }
    }

    /**
     * 
     * @param {Object} object 
     * @param {Player} player 
     * @returns 
     */
    send(object, player) {
        if (!object || !player) {
            return;
        }

        player.send(object);
    }

    removePlayer(id) {
        this.players.get(id).closeWebSocket();
        this.players.delete(id);

        const size = this.getSize();
        if (size === 0 && typeof this.listeners["empty"] === 'function') {
            this.emit("empty", this.id);
        } else {
            const message = {
                type: "exited",
                body: { id }
            };

            this.broadcast(message);
        }
    }

    onempty(callback) {
        this.addEventListener("empty", callback);
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

    // empty = null
    // onEmpty(callback) {
    //     empty = callback;
    // }
}

module.exports = Room;