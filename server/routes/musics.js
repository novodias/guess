const path = require("path");
const fs = require("fs")
const Cluster = require(`../wss`);
const express = require('express');
const AbortError = require("../models/abortError");
const router = express.Router();

const MUSICS_DIRECTORY = process.env.MUSIC_DIRECTORY;
// const musicTest = (title, name) => path.join(MUSICS_DIRECTORY, title, name) + '.m4a';
const music = (partialPath) => path.join(MUSICS_DIRECTORY, partialPath) + '.m4a';

class FileNotFoundError extends Error {
    /**
     * @type {?number}
     */
    errno
    /**
     * @type {?string}
     */
    code
    /**
     * @type {?string}
     */
    path
    /**
     * @type {?string}
     */
    syscall
    
    /**
     * @param {Error} err 
     */
    constructor(err) {
        super(err)
        this.errno = err.errno;
        this.code = err.code;
        this.path = err.path;
        this.syscall = err.syscall;
    }
}

const checkAsync = (path) => new Promise((resolve, reject) => {
    fs.stat(path, function (err, stat) {
        if (err == null) {
            resolve(null);
        } else {
            reject(new FileNotFoundError(err));
            // reject(err);
        }
    });
});

router.get("/:roomid", async (req, res, next) => {
    try {
        const roomId = req.params.roomid;
        const musicHash = req.query.hash;
    
        /**
         * @type {Cluster}
         */
        const cluster = req.cluster;
        const room = cluster.getRoom(roomId);
    
        if (room === undefined) {
            res.status(404).send("Not found");
            return;
        }
    
        if (musicHash !== room.musicStorageInfo.hash) {
            res.status(401).send("Not authorized");
            return;
        }
    
        const path = music(room.musicStorageInfo.partialPath);
        await checkAsync(path);
        res.type("audio/mp4");
        res.sendFile(path);
    } catch (err) {
        if (err instanceof FileNotFoundError) {
            next(new AbortError("Path to file doesn't exist or it is incorrect", 404, err));
            console.log("Error trying to found music file: ", err.message, err.code);
        } else {
            next(err);
        }
    }
});

// router.get("/:title/:name", async (req, res) => {
//     const {title, name} = req.params;
//     const musicPath = musicTest(title, name);
//     try {
//         // throws a error if the file doesn't exist
//         await checkAsync(musicPath);
//         res.type("audio/mp4");
//         res.sendFile(musicPath);
//         // res.send(musicPath);
//     } catch (error) {
//         res.status(404).send("Not found LOL");
//         console.log("Error trying to found music file: ", error.message, error.code);
//     }
// });

module.exports = router;