"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const abortError_1 = __importDefault(require("../models/abortError"));
const express_1 = require("express");
const musics = (0, express_1.Router)();
const config_1 = __importDefault(require("../config"));
const MUSICS_DIRECTORY = (0, path_1.join)(config_1.default.assetsDir, "musics");
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
musics.get("/:roomid", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.roomid;
        const musicHash = req.query.hash;
        const cluster = req.cluster;
        const room = cluster.getRoom(roomId);
        if (room === undefined || room.musicDetails === undefined) {
            throw new abortError_1.default("Not found", 404);
        }
        if (musicHash !== room.musicDetails.hash) {
            throw new abortError_1.default("Not authorized", 401);
        }
        req.room = room;
        next();
    }
    catch (err) {
        next(err);
    }
}));
musics.get("/:roomid", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = req.room;
        res.sendFile(room.musicDetails.partialPath, {
            root: MUSICS_DIRECTORY,
            extensions: 'm4a',
            lastModified: false,
        }, (err) => {
            if (err)
                next(err);
        });
    }
    catch (err) {
        next(err);
    }
}));
musics.get("/:title/:name", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, name } = req.params;
    try {
        res.type("audio/m4a");
        res.sendFile((0, path_1.join)(title, name), {
            root: MUSICS_DIRECTORY,
            extensions: 'm4a',
            lastModified: false,
        }, (err) => {
            if (err)
                next(err);
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = musics;
