const Player = require("./player");

class Room {

    /**
     * 
     * @param {String} id 
     */
    constructor(id) {
        this.id = id;
        this.players = new Map();
    }

    getSize() {
        return this.players.size;
    }

    getPlayers() {
        return Array
            .from(this.players)
            .map(player => player.getPlayerData());
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

        const messageAll = {
            type: "joined",
            body: player.getPlayerData(),
        };

        const messageOne = {
            type: "players",
            body: this.getPlayers(),
        };

        this.send(messageOne, player);
        // sends to all players the person who's joined
        this.sendAll(messageAll, player);
    }

    
    /**
     * 
     * @param {Object} object 
     * @param {*} ignore 
     */
    sendAll(object, ignore) {
        if (!object) {
            return;
        }

        this.players.forEach(player => {
            if (!ignore.id || player.id !== ignore.id) {
                if (player instanceof Player) {
                    player.send(object);
                }
            }
        })
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
        if (size === 0 && typeof this.onEmptyRoom === 'function') {
            onEmptyRoom(this.id);
        } else {
            const message = {
                type: "exited",
                id
            };

            this.sendAll(message);
        }
    }

    onEmptyRoom = null;
}

module.exports = Room;