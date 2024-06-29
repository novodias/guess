"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const avatars_1 = __importDefault(require("./avatars"));
const musics_1 = __importDefault(require("./musics"));
const rooms_1 = __importDefault(require("./rooms"));
const songs_1 = __importDefault(require("./songs"));
const titles_1 = __importDefault(require("./titles"));
const routers = { avatars: avatars_1.default, musics: musics_1.default, rooms: rooms_1.default, songs: songs_1.default, titles: titles_1.default };
exports.default = routers;
