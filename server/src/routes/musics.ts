import { join } from "path";
// import fs from "fs";
import RoomsCluster from "../cluster";
import AbortError from "../models/abortError";
import { Request, Response, Router } from "express";
const musics: Router = Router();

import config from "../config";
const MUSICS_DIRECTORY = join(config.assetsDir, "musics");
// const musicTest = (title, name) => path.join(MUSICS_DIRECTORY, title, name) + '.m4a';
// const music = (partialPath: string) => join(MUSICS_DIRECTORY, partialPath) + '.m4a';
// class FileNotFoundError extends Error {
//     /**
//      * @type {?number}
//      */
//     errno
//     /**
//      * @type {?string}
//      */
//     code
//     /**
//      * @type {?string}
//      */
//     path
//     /**
//      * @type {?string}
//      */
//     syscall
    
//     /**
//      * @param {Error} err 
//      */
//     constructor(err: any) {
//         super(err.message)
//         this.name = "FileNotFoundError";
//         this.errno = err.errno;
//         this.code = err.code;
//         this.path = err.path;
//         this.syscall = err.syscall;
//     }
// }

musics.get("/:roomid", async (req, res, next) => {
    try {
        const roomId = req.params.roomid;
        const musicHash = req.query.hash;
    
        const cluster: RoomsCluster = req.cluster;
        const room = cluster.getRoom(roomId);
    
        if (room === undefined || room.musicDetails === undefined) {
            throw new AbortError("Not found", 404);
        }
    
        if (musicHash !== room.musicDetails.hash) {
            throw new AbortError("Not authorized", 401);
        }

        req.room = room;
        next();
    } catch (err) {
        next(err);
    }
})

musics.get("/:roomid", async (req: Request, res: Response, next) => {
    try {
        const room = req.room!;
        res.sendFile(room.musicDetails!.partialPath, {
            root: MUSICS_DIRECTORY,
            extensions: 'm4a',
            lastModified: false,
        }, (err) => {
            if (err) next(err);
        });
    } catch (err) {
        next(err);
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