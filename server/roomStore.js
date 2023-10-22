function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
};

const createMusicObj = (path) => {
    return {
        hash: makeid(9),
        path
    };
};

function createRoomMapStore() {
    /**
     * @typedef MusicHash
     * @property {String} hash
     * @property {String} path
     */
    
    /**
     * @type {Map<String, MusicHash>}
     */
    const roomMapStore = new Map();
    const set = (roomid, path) => {
        const obj = createMusicObj(path);
        roomMapStore.set(roomid, obj);
        return obj.hash;
    }
    const remove = (roomid) => {
        if (roomMapStore.has(roomid)) {
            roomMapStore.delete(roomid);
        }
    }
    const has = (roomid) => roomMapStore.has(roomid);
    const get = (roomid) => roomMapStore.get(roomid);

    return {
        store: roomMapStore,
        set,
        has,
        get,
        remove
    };
}

module.exports = createRoomMapStore;