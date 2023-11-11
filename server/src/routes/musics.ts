import { join } from "path";
import fs from "fs";
import RoomsCluster from "../wss";
import AbortError from "../models/abortError";
import { Request, Response, Router } from "express";
const musics: Router = Router();

if (require.main === undefined) {
    throw new Error("require main undefined");
}

const MUSICS_DIRECTORY = join(require.main.path, "assets", "musics");
// const musicTest = (title, name) => path.join(MUSICS_DIRECTORY, title, name) + '.m4a';
const music = (partialPath: string) => join(MUSICS_DIRECTORY, partialPath) + '.m4a';

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
    constructor(err: any) {
        super(err.message)
        this.name = "FileNotFoundError";
        this.errno = err.errno;
        this.code = err.code;
        this.path = err.path;
        this.syscall = err.syscall;
    }
}

const checkAsync = (path: string) => new Promise((resolve, reject) => {
    fs.stat(path, function (err, stat) {
        if (err == null) {
            resolve(null);
        } else {
            reject(new FileNotFoundError(err));
            // reject(err);
        }
    });
});

musics.get("/:roomid", async (req: Request, res: Response, next) => {
    try {
        const roomId = req.params.roomid;
        const musicHash = req.query.hash;
    
        const cluster: RoomsCluster = req.cluster!;
        const room = cluster.getRoom(roomId);
    
        if (room === undefined || room.musicDetails === undefined) {
            res.status(404).send("Not found");
            return;
        }
    
        if (musicHash !== room.musicDetails.hash) {
            res.status(401).send("Not authorized");
            return;
        }
    
        const path = music(room.musicDetails.partialPath);
        await checkAsync(path);
        res.type("audio/mp4");
        res.sendFile(path);
    } catch (err) {
        if (err instanceof FileNotFoundError) {
            next(new AbortError("Path to file doesn't exist or it is incorrect", 404));
            console.log("Error trying to found music file: ", err.message, err.code);
        } else {
            next(err);
        }
    }
});

// musics.get("/:title/:name", async (req, res) => {
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

export default musics;