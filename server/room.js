// const { WebSocket } = require('ws');
const Player = require("./player");
const uuid = require('uuid');

class Room {
    /**
     * 
     * @param {String} id
     * @param {String} name 
     * @param {String} passwordHash
     * @param {boolean} isPrivate
     */
    constructor(id, name, passwordHash, isPrivate) {
        this.id = id;
        this.name = name;
        this.isPrivate = isPrivate;
        this.passwordHash = passwordHash || null;
        this.hasPassword = passwordHash !== null;
        this.ownerId = uuid.v4();
        
        this.players = new Map();
        this.listeners = {};

        // todo: add a timer to start the game
        // todo: get random songs
        // todo: kicked players (don't allow back in)
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

    getRoomInformation() {
        return {
            id: this.id,
            name: this.name,
            requirePassword: this.passwordHash !== null,
            isPrivate: this.isPrivate,
        };
    }
    
    getRoomData() {
        return {
            id: this.id,
            players: this.getPlayers(),
        };
    }

    /**
     * 
     * @param {Number} id 
     * @returns {Player | undefined}
     */
    _getPlayer(id) { return this.players.get(id) }

    /**
     * 
     * @param {*} message 
     * @param {Player} player 
     */
    _handleMessage(message, player) {
        const type = message.type;
        const body = message.body;

        console.log(message);
        
        const handler = {
            "kick": () => {
                const isOwner = body.owner === this.ownerId;

                if (!isOwner) {
                    return;
                }

                // console.log("kick:", body);
                this.removePlayer(body.id, 3000, "You got kicked from the room.");
            },

            "submit": () => {
                const id = body.id;
                const title_id = body.title.id;

                // todo: do the rest of the game lol
                // gonna need to verify title_id answer with the randomly selected

                const player = this.players.get(id);

                // the player class emits a change event and broadcasts to all
                player.setPoints(player.points + 15);
            },

            "chat": () => {
                // self explanatory
                this.broadcast({
                    type: "chat",
                    body: { text: body.text, nickname: player.nickname }
                });
            }
        }

        handler[type]();
    }

    /**
     * 
     * @param {MessageEvent} e 
     * @returns {*}
     */
    parse(e) {
        return JSON.parse(e.data.toString());
    }

    /**
     * 
     * @param {Player} player 
     */
    addPlayer(player) {
        player.ws.on("close", () => {
            console.log(`[Room/${this.id}] ${player.id}/${player.nickname} exited the room`);
            
            if (this.players.has(player.id)) {
                this.removePlayer(player.id);
            }
        });

        player.ws.onmessage = (e) => {
            const message = this.parse(e);
            this._handleMessage(message, player);
        }

        player.onchange(body => {
            // broadcast changes to all;
            this.broadcast({type: "change", body});
        })

        this.players.set(player.id, player);

        // const joined = {
        //     type: "joined",
        //     body: player.getPlayerData(),
        // };

        const you = {
            type: "yourid",
            body: { id: player.id }
        };

        const players = {
            type: "players",
            body: this.getPlayers(),
        };

        // sends to player who's joined all the players
        // this.send(players, player);
        
        // send id to the player
        this.send(you, player);
        
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

    removePlayer(id, code = undefined, reason = undefined) {
        const player = this._getPlayer(id);
        player && player.closeWebSocket(code, reason);

        this.players.delete(id);

        const size = this.getSize();
        if (size === 0 && typeof this.listeners["empty"] === 'function') {
            // emits empty and then the cluster deletes the room
            this.emit("empty", this.id);
        } else {
            // broadcast player that exited
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