const { Player } = require("./player");
const { Song } = require('./db');
const { intFromInterval, makeid } = require('./utils');
const uuid = require('uuid');

class Room {

    static STATUS = Object.freeze({
        WAITING: 'waiting',
        PREPARING: 'preparing',
        STARTED: 'started',
        ENDED: 'ended'
    });

    /**
     * 
     * @param {String} id
     * @param {String} name 
     * @param {String} passwordHash
     * @param {boolean} isPrivate
     * @param {Array<Song>} songs
     */
    constructor(id, name, passwordHash, isPrivate, songs) {
        this.id = id;
        this.name = name;
        this.isPrivate = isPrivate;
        this.passwordHash = passwordHash || null;
        this.hasPassword = passwordHash !== null;
        this.ownerId = uuid.v4();
        this.listeners = {};
        
        // GAME PROPERTIES
        this.status = Room.STATUS.WAITING; // wait owner to start
        /**
         * @type {Map<Number, Player>}
         */
        this.players = new Map();
        
        this.rounds = 0;
        this.roundTime = 30; // make it a option on frontend
        this.roundPrepare = 5; // make it a option on frontend
        this.maxRounds = 10; // make it a option on frontend

        // songs
        this.songs = songs; // has 10 here - use maxRounds to get the right amount
        this.selected = null; // selects on prepareRound
        this.musicStorageInfo = null;
        
        // timer
        this.timer = null;
        this.timerFunction = this._prepareRound;

        // todo: don't allow clients to connect if status is not 'waiting';
        // todo: kicked players (don't allow back in);
    }

    _selectRandomSong() {
        const rnd = intFromInterval(0, this.songs.length - 1);
        
        this.selected = this.songs[rnd];
        this.musicStorageInfo = {
            hash: makeid(9),
            partialPath: this.selected.partialPath
            // partialPath: getPartialPath(this.selected.name, this.selected.song_name)
        };
        this.songs = this.songs.filter((song, idx) => idx !== rnd);

        console.log(`[Room/${this.id}] Hash: ${this.musicStorageInfo.hash} / Selected song:`, this.selected.name);
    }

    _clearTimer() {
        if (this.timer === null) {
            return;
        }

        clearTimeout(this.timer);
    }

    _startTimer(seconds) {
        this.timer = setTimeout(this.timerFunction, 1000 * seconds);
    }

    _prepareRound() {
        if (this.rounds === this.maxRounds) {
            this._endGame();
            return;
        }
    
        this.rounds += 1;
        this.status = Room.STATUS.PREPARING;
        this._selectRandomSong();
        const start_at = intFromInterval(5, this.selected.duration - 30);

        const prepare = {
            type: "prepare",
            body: {
                room_status: this.status,
                round: this.rounds,
                music_hash: this.musicStorageInfo.hash,
                start_at,
            }
        };

        this.broadcast(prepare);
        this.timerFunction = this._startRound.bind(this);

        // roundPrepare default = 5
        this._startTimer(this.roundPrepare);
    }

    _startRound() {
        this.players.forEach(ply => {
            ply.status = Player.STATUS.PENDING;
        });

        this.status = Room.STATUS.STARTED;

        const round = {
            type: "round",
            body: {
                room_status: this.status,
                players: this.getPlayers()
            }
        };

        this.broadcast(round);
        this.timerFunction = this._prepareRound.bind(this);

        // roundTime default = 30
        this._startTimer(this.roundTime);
    }

    _endGame() {
        const winner = this.getPlayers()
            .sort((v1, v2) => v2.points - v1.points)[0];

        this.status = Room.STATUS.ENDED;
        
        const end = {
            type: "end",
            body: {
                winner,
                room_status: this.status,
            }
        };

        this.broadcast(end);
    }

    getSize() {
        return this.players.size;
    }

    /**
     * 
     * @returns {Array<{id, nickname, points, status}>}
     */
    getPlayers() {
        return Array
            .from(this.players)
            .map(([id, player]) => {
                return player.data;
            });
    }

    /**
     * @param {Number} status 
     * @returns {Array<Player>}
     */
    _getPlayersByStatus(status) {
        return Array
            .from(this.players)
            .filter(([id, player]) => {
                return player.status === status
            });
    }

    /**
     * This will return data that is available to the public.
     */
    get public() {
        return {
            id: this.id,
            name: this.name,
            requirePassword: this.hasPassword,
            isPrivate: this.isPrivate,
        };
    }
    
    /**
     * This will return data that is available to people that joined the room.
     */
    get private() {
        return {
            id: this.id,
            name: this.name,
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
        // console.log(message);
        
        const handler = {
            "start": () => {
                const isOwner = body.owner === this.ownerId;

                if (!isOwner) {
                    return;
                }

                if (this.status !== Room.STATUS.WAITING) {
                    return;
                }

                this._prepareRound();
            },

            "kick": () => {
                const isOwner = body.owner === this.ownerId;

                if (!isOwner) {
                    return;
                }

                // console.log("kick:", body);
                this.removePlayer(body.id, 3000, "You got kicked from the room.", true);
            },

            "submit": () => {
                const id = body.id;
                const title_id = body.title.id;
                const pending = this._getPlayersByStatus(Player.STATUS.PENDING);

                // if player its not with status pending, ignore
                // if (!pending.find(p => p.id === id)) {
                //     return;
                // }

                const player = this.players.get(id);

                const ratio = pending.length / this.players.size;
                let status = this.selected.title_id === title_id ? Player.STATUS.CORRECT : Player.STATUS.WRONG;
                let points = status === Player.STATUS.CORRECT ? Math.floor(player.points + 15 * ratio) : player.points;
                
                // the player class emits a onchange event and broadcasts to all
                player.set(points, status);

                // if pending is 1, that means it is the last that just submitted - prepare new round
                // disable this for now.
                // if (pending.length === 1) {
                //     this._clearTimer();
                //     this._prepareRound();
                // }
            },

            // self explanatory
            "chat": () => {
                this.broadcast({
                    type: "chat",
                    body: { text: body.text, nickname: player.nickname }
                });
            },

            "joined": () => {
                console.log("Someone tried to join");
            }
        }

        try {
            handler[type]();
        } catch (error) {
            console.error(`type: ['${type}'] throwed an error:\n`, error);
        }
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
            // console.log('onchange:', body);
            this.broadcast({ type: "change", body });
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

    removePlayer(id, code = undefined, reason = undefined, kicked = false) {
        const player = this._getPlayer(id);
        player && player.closeWebSocket(code, reason);

        this.players.delete(id);

        const size = this.getSize();
        if (size === 0 && typeof this.listeners["empty"] === 'function') {
            // emits empty and then the cluster deletes the room
            this._clearTimer();
            this.emit("empty", this.id);
        } else {
            const message = {
                type: "exited",
                body: {
                    id,
                    kicked
                }
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
}

module.exports = Room;