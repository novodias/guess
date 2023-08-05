// const { WebSocket } = require('ws');
const { Player, PlayerStatus } = require("./player");
const { Song } = require('./db');
const random = require('./random');
const uuid = require('uuid');


const RoomStatus = Object.freeze({
    WAITING: 'waiting',
    PREPARING: 'preparing',
    STARTED: 'started',
    ENDED: 'ended'
});

class Room {

    /**
     * 
     * @param {String} id
     * @param {String} name 
     * @param {String} passwordHash
     * @param {boolean} isPrivate
     * @param {Array<{id, title_id, type, song_name, song_duration, youtube_id}>} songs
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
        this.status = RoomStatus.WAITING; // wait owner to start
        this.players = new Map();
        
        this.rounds = 0;
        this.roundTime = 30; // make it a option on frontend
        this.roundPrepare = 5; // make it a option on frontend
        this.maxRounds = 10; // make it a option on frontend

        // songs
        this.songs = songs; // has 10 here - use maxRounds to get the right amount
        this.selected = null; // selects on prepareRound
        
        // timer
        this.timer = null;
        this.timerFunction = this._prepareRound;

        // todo: don't allow clients to connect if status is not 'waiting';
        // todo: kicked players (don't allow back in);
    }

    _selectRandomSong() {
        const rnd = random.intFromInterval(0, songs.length - 1);
        this.selected = songs[rnd];
        this.songs = this.songs.filter((song, idx) => idx !== rnd);
    }

    _clearTimer() {
        if (timer === null) {
            return;
        }

        clearTimeout(timer);
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
        this.status = RoomStatus.PREPARING;
        this._selectRandomSong();

        const prepare = {
            type: "prepare",
            body: {
                room_status: this.status,
                round: this.rounds,
                maxRounds: this.maxRounds,
            }
        };

        this.broadcast(prepare);
        this.timerFunction = this._startRound;

        // roundPrepare default = 5
        this._startTimer(this.roundPrepare);
    }

    _startRound() {
        this.players.forEach(ply => {
            ply.status = PlayerStatus.Pending;
        });

        this.status = RoomStatus.STARTED;

        const round = {
            type: "round",
            body: {
                room_status: this.status,
                players: this.getPlayers()
            }
        };

        this.broadcast(round);
        this.timerFunction = this._prepareRound;

        // roundTime default = 30
        this._startTimer(this.roundTime);
    }

    _endGame() {
        const winner = this.getPlayers()
            .sort((v1, v2) => v2.points - v1.points)[0];

        this.status = RoomStatus.ENDED;
        
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
     * @returns {Array<{id, room_id, nickname, points, status}>}
     */
    getPlayers() {
        return Array
            .from(this.players)
            .map(([id, player]) => {
                return player.getPlayerData();
            });
    }

    /**
     * @param {Number} status 
     * @returns {Array<Player>}
     */
    _getPlayersByStatus(status) {
        return Array
            .from(this.players)
            .map(([id, player]) => {
                if (player.status === status) {
                    return player;
                }
            });
    }

    getRoomInformation() {
        return {
            id: this.id,
            name: this.name,
            requirePassword: this.hasPassword,
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
            "start": () => {
                const isOwner = body.owner === this.ownerId;

                if (!isOwner) {
                    return;
                }

                if (this.status !== RoomStatus.WAITING) {
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
                this.removePlayer(body.id, 3000, "You got kicked from the room.");
            },

            "submit": () => {
                const id = body.id;
                const title_id = body.title.id;
                const pending = this._getPlayersByStatus(PlayerStatus.PENDING);

                // if player its not with status pending, ignore
                if (!pending.find(p => p.id === id)) {
                    return;
                }

                const player = this.players.get(id);

                if (!(this.selected instanceof {id, title_id, type, song_name, song_duration, youtube_id})) {
                    throw new Error("Selected song is null");
                }

                const ratio = pending.length / this.players.size;
                let status = this.selected.title_id === title_id ? PlayerStatus.CORRECT : PlayerStatus.WRONG;
                let points = status === PlayerStatus.CORRECT ? Math.floor(player.points + 15 * ratio) : player.points;
                
                // the player class emits a onchange event and broadcasts to all
                player.set(points, status);

                // if pending is 1, that means it is the that just submitted - prepare new round
                if (pending.length === 1) {
                    this._clearTimer();
                    this._prepareRound();
                }
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
}

module.exports = Room;