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
const utils_1 = require("../utils");
const abortError_1 = __importDefault(require("../models/abortError"));
const abortError_2 = __importDefault(require("../models/abortError"));
const songs_controller_1 = __importDefault(require("../database/songs.controller"));
const rooms = (0, express_1.Router)();
rooms.get("/all", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const start = parseInt(req.query.start);
        const count = parseInt(req.query.count);
        const object = req.cluster.getRooms(start, count);
        res.json(object);
    }
    catch (err) {
        next(err);
    }
}));
rooms.get("/find", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.query;
        const rooms = req.cluster.query(name);
        res.json(rooms);
    }
    catch (err) {
        next(err);
    }
}));
const ensureRoomAuthentication = (room, hash, res) => {
    if ((0, utils_1.nullOrUndefined)(hash)) {
        res.json(room.public);
        console.log(`[Rooms/${room.id}] Room with password found, password not inserted`);
    }
    if (room.password !== hash) {
        console.log(`[Rooms/${room.id}] Room found, wrong authentication`);
        throw new abortError_1.default("Room's password doesn't match", 400, Object.assign(Object.assign({}, room.public), { message: "Password doesn't match" }));
    }
};
rooms.use("/", (req, res, next) => {
    try {
        if (req.method === 'GET') {
            const id = req.query.id;
            const authorization = req.headers.authorization;
            const hash = Buffer.from(authorization || "", 'base64').toString('ascii');
            const room = req.cluster.getRoom(id);
            if (!room) {
                console.log("[Rooms] Couldn't found room", id);
                throw new abortError_1.default("Room not found", 404);
            }
            req.room = room;
            if (room.hasPassword) {
                ensureRoomAuthentication(room, hash, res);
            }
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
rooms.get("/", (req, res) => {
    const room = req.room;
    res.json(room.private);
});
rooms.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const content_type = req.get("Content-Type");
        if (!content_type || content_type !== "application/json") {
            throw new abortError_2.default("Content type not acceptable", 406);
        }
        const config = req.body;
        const cluster = req.cluster;
        const songsRepo = req.services.getRequired(songs_controller_1.default);
        const songs = yield songsRepo.random(10);
        const roomInfo = cluster.createRoom(config, songs);
        res.json(roomInfo);
    }
    catch (err) {
        next(err);
    }
}));
exports.default = rooms;
