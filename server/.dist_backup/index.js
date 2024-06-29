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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env' });
dotenv_1.default.config({ path: '.env.local', override: true });
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}`, override: true });
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}.local`, override: true });
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const abortError_1 = __importDefault(require("./models/abortError"));
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const cluster_1 = __importDefault(require("./cluster"));
const db_1 = require("./database/db");
const provider_1 = require("./provider");
const express_subdomain_1 = __importDefault(require("express-subdomain"));
const titles_controller_1 = __importDefault(require("./database/titles.controller"));
const songs_controller_1 = __importDefault(require("./database/songs.controller"));
const song_model_1 = __importDefault(require("./models/song.model"));
const exports_1 = __importDefault(require("./routes/exports"));
const PORT = parseInt(process.env.PORT || "") || 3001;
const logger = (0, logger_1.loggerFactory)("Main");
const app = (0, express_1.default)()
    .use((0, cors_1.default)({
    credentials: false,
    // origin: ["https://ritmovu.dev", "https://api.ritmovu.dev", "https://cdn.ritmovu.dev"],
    methods: "GET, POST",
}))
    .use(body_parser_1.default.json())
    .use(body_parser_1.default.urlencoded({ extended: false }));
if (process.env.NODE_ENV === 'production') {
    const buildPath = path_1.default.join(process.env.DIST_BUILD);
    app.use(express_1.default.static(buildPath));
    // app.get("(/*)?", async (req, res, next) => {
    //     res.sendFile(path.join(buildPath, 'index.html'));
    // });
    app.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        res.sendFile(path_1.default.join(buildPath, 'index.html'));
    }));
}
let server;
if (process.env.HTTPS === 'true') {
    try {
        const options = {
            key: (0, fs_1.readFileSync)(process.env.HTTPS_KEY || ""),
            cert: (0, fs_1.readFileSync)(process.env.HTTPS_CERT || ""),
        };
        server = https_1.default.createServer(options, app);
        logger.log("Https enabled");
    }
    catch (error) {
        logger.error(error);
        server = http_1.default.createServer(app);
        logger.log("Something went wrong, using Http instead.");
    }
}
else {
    server = http_1.default.createServer(app);
}
// app.use(function (request, response, next) {
//     if (process.env.NODE_ENV != 'development' && !request.secure) {
//         console.log("Redirected to https");
//         return response.redirect("https://" + request.headers.host + request.url);
//     }
//     next();
// });
function abort(res, abortObject) {
    res.status(abortObject.code).json(abortObject.sanitized);
}
const api = express_1.default.Router();
const services = new provider_1.ServiceBuilder()
    .useLogger(true)
    .add(db_1.GuessRepository.instance)
    .add(new songs_controller_1.default(db_1.GuessRepository.instance))
    .add(new titles_controller_1.default(db_1.GuessRepository.instance))
    .add(new cluster_1.default(server, PORT))
    .build();
api.use((req, res, next) => {
    req.services = services;
    req.cluster = services.getRequired(cluster_1.default);
    res.abort = (abortMsg) => abort(res, abortMsg);
    next();
});
// api.get("/", (req, res) => {
//     res.send("Ok");
// });
// api.get("/secret", async (req, res, next) => {
//     try {
//         throw new AbortError("You found my secret page :)", 500);
//     } catch (err) {
//         next(err);
//     }
// });
api.post("/error", (req, res) => {
    logger.debug(req.body);
    res.send("Ok");
});
function hasInvalidBody(body) {
    return (0, utils_1.iterableAnyNullOrUndefined)([...Object.values(body)]);
}
/**
 * @param {Titles} titlesRepo
 * @returns {Promise<Title>}
 */
function getOrAddTitle(titlesRepo, { title_id, title_name, title_type, title_tags }) {
    return __awaiter(this, void 0, void 0, function* () {
        let title = undefined;
        if (title_id === 0) {
            logger.debug("[TitlesController] Title doesn't exist, creating", title_name);
            title = yield titlesRepo.add(title_name, title_type, title_tags);
        }
        else {
            title = yield titlesRepo.findById(title_id);
            if (!(0, utils_1.compareArrays)(title.tags, title_tags)) {
                logger.debug("[TitlesController] Tags are diferent, updating title");
                yield titlesRepo.updateTags(title.id, title_tags);
            }
            title.tags = title_tags;
        }
        return title;
    });
}
/**
 * @param {Songs} songsRepo
 */
function ensureSongExists(songsRepo, title, { song_name, youtube_id }) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundYtId = yield songsRepo.findWithYoutubeId(youtube_id);
        if (foundYtId) {
            logger.debug("[SongsController] Youtube ID found, ignoring create", youtube_id);
            throw new abortError_1.default("A song with the youtube ID sent already exists.", 400);
        }
        const songs = yield songsRepo.find(song_name, title.type, title.id);
        if (songs.length > 0) {
            logger.debug("[SongsController] Song name found, ignoring create", song_name);
            throw new abortError_1.default("A song with the same name already exists.", 400);
        }
    });
}
/**
 * @param {Songs} songsRepo
 */
function addSong(songsRepo, title, { song_name, youtube_id }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const serviceResponse = yield fetch("http://127.0.0.1:5000/fetch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title_name: title.nameFiltered,
                    song_name: (0, utils_1.filterName)(song_name),
                    youtube_id: youtube_id
                })
            });
            if (serviceResponse.status !== 201) {
                logger.error("Service song downloader not running");
                throw new abortError_1.default("API to download songs is not available", 500);
            }
            const { duration, /* partial_path */ } = yield serviceResponse.json();
            const data = {
                title_id: title.id,
                type: title.type,
                song_name: song_name,
                song_duration: duration,
                youtube_id: youtube_id
            };
            if (hasInvalidBody(data)) {
                throw new Error("Something went wrong fetching the song details");
            }
            const song = new song_model_1.default(data);
            return songsRepo.add(song);
        }
        catch (err) {
            if (err instanceof TypeError) {
                logger.error("Service song downloader not running");
                throw new abortError_1.default("API to download songs is not available", 500);
            }
        }
    });
}
api.post("/create", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new abortError_1.default("Not acceptable", 406);
        }
        if (hasInvalidBody(req.body)) {
            throw new abortError_1.default("Request body invalid", 400);
        }
        const { title_id, title_name, title_type, title_tags, song_name, youtube_id } = req.body;
        const titlesRepo = req.services.getRequired(titles_controller_1.default);
        const songsRepo = req.services.getRequired(songs_controller_1.default);
        const title = yield getOrAddTitle(titlesRepo, { title_id, title_name, title_type, title_tags });
        yield ensureSongExists(songsRepo, title, { song_name, youtube_id });
        const result = yield addSong(songsRepo, title, { song_name, youtube_id });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}));
if (process.env.HTTPS === 'true') {
    api.use("/musics", (0, express_subdomain_1.default)('cdn', exports_1.default.musics));
}
else {
    api.use("/musics", exports_1.default.musics);
}
logger.log("Route /musics enabled");
api.use("/rooms", exports_1.default.rooms);
logger.log("Route /rooms enabled");
api.use("/songs", exports_1.default.songs);
logger.log("Route /songs enabled");
api.use("/titles", exports_1.default.titles);
logger.log("Route /titles enabled");
api.use("/avatars", exports_1.default.avatars);
logger.log("Route /avatars enabled");
const clientErrorHandler = (err, req, res, next) => {
    if (err instanceof abortError_1.default) {
        res.abort(err);
        logger.debug("Aborted request due to client error:", err.message);
    }
    else {
        next(err);
    }
};
const errorHandler = (err, req, res, next) => {
    res.status(500);
    if (process.env.NODE_ENV == 'development') {
        res.send(`<div>
            <p>Something went wrong, sorry!</p>
            <p>${err.message + ' ' + err.stack || ''}</p>
        </div>`);
    }
    else {
        res.send(`
        <div>
            <p>Something went wrong, sorry!</p>
        </div>
        `);
        logger.error(err);
    }
};
api.use(clientErrorHandler);
api.use(errorHandler);
if (process.env.NODE_ENV == 'development') {
    app.use("/", api);
}
else {
    app.use("/api", api);
}
server.listen(PORT, () => {
    logger.log(`Listening on ${PORT}`);
});
