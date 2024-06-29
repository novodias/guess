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
const express_1 = require("express");
const abortError_1 = __importDefault(require("../models/abortError"));
const songs_controller_1 = __importDefault(require("../database/songs.controller"));
const songs = (0, express_1.Router)();
songs.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const songsRepo = req.services.getRequired(songs_controller_1.default);
        const result = yield songsRepo.find(query.name, query.type, query.id);
        if (result.length <= 0) {
            throw new abortError_1.default("Not found", 404);
        }
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}));
// songs.post("/create", async (req, res) => {
//     const {
//         title_id,
//         type,
//         song_name,
//         youtube_id
//     } = req.body;
//     const db = req.db;
//     const content_type = req.get("Content-Type");
//     if (content_type && content_type !== "application/json") {
//         res.status(406).send("Not acceptable");
//     }
//     // todo: verify visibility
//     try {
//         const video = await youtubeGet(youtube_id, YOUTUBE_API_KEY);
//         const duration = moment
//             .duration(video.items[0].contentDetails.duration, moment.ISO_8601)
//             .asSeconds();
//         const song = new db.Song(title_id, type, song_name, duration, youtube_id);
//         const result = await db.add_song(song);
//         res.json(result);
//     } catch (error) {
//         res.status(404).send("Not found");
//         console.log(error);
//     }
// });
// temporary
// songs.get("/random", async (req, res) => {
//     const { total, type } = req.query;
//     const db = req.db;
//     const result = await db.get_songs_random(Number.parseInt(total), type);
//     res.json(result);
// });
exports.default = songs;
