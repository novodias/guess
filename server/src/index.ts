import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: `.env.${process.env.NODE_ENV}`, override: true });
dotenv.config({ path: `.env.${process.env.NODE_ENV}.local`, override: true });

import https from 'https'
import http from 'http'
import express, { Application, Request, Response, NextFunction } from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import path from 'path';
import AbortError from "./models/abortError";
import { compareArrays, filterName, iterableAnyNullOrUndefined } from './utils';
import { loggerFactory } from './logger';
import RoomsCluster from "./cluster";
import { GuessRepository } from "./database/db";
import { ServiceBuilder } from './provider';
import subdomain from 'express-subdomain';
import Titles from './database/titles.controller';
import Title from './models/title.model';
import Songs from './database/songs.controller';
import Song from './models/song.model';
import routers from "./routes/exports";

const PORT: number = parseInt(process.env.PORT || "") || 3001;
const logger = loggerFactory("Main");
const app: Application = express()
    .use(cors({
        credentials: true,
        origin: ["https://ritmovu.dev", "https://api.ritmovu.dev", "https://cdn.ritmovu.dev"],
        methods: "GET, POST",
    }))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }));

// if (process.env.NODE_ENV === 'production') {
//     const buildPath = path.join(__dirname, "client", "build");
//     app.use(express.static(buildPath));
//     app.get("(/*)?", async (req, res, next) => {
//         res.sendFile(path.join(buildPath, 'index.html'));
//     });
// }

let server;
if (process.env.HTTPS === 'true') {
    try {
        const options: https.ServerOptions = {
            key: readFileSync(process.env.HTTPS_KEY || ""),
            cert: readFileSync(process.env.HTTPS_CERT || ""),
        };
    
        server = https.createServer(options, app);
    
        logger.log("Https enabled");
    } catch (error) {
        logger.error(error);
        server = http.createServer(app);
        logger.log("Something went wrong, using Http instead.");
    }
} else {
    server = http.createServer(app);
}

// app.use(function (request, response, next) {
//     if (process.env.NODE_ENV != 'development' && !request.secure) {
//         console.log("Redirected to https");
//         return response.redirect("https://" + request.headers.host + request.url);
//     }
//     next();
// });

function abort(res: Response, abortObject: AbortError) {
    res.status(abortObject.code).json(abortObject.sanitized);
}

const api = express.Router();
const services = new ServiceBuilder()
    .useLogger(true)
    .add(GuessRepository.instance)
    .add(new Songs(GuessRepository.instance))
    .add(new Titles(GuessRepository.instance))
    .add(new RoomsCluster(server, PORT))
    .build();

api.use((req: Request, res: Response, next: NextFunction) => {
    req.services = services;
    req.cluster = services.getRequired(RoomsCluster);
    res.abort = (abortMsg: AbortError) => abort(res, abortMsg);
    next();
});

api.get("/", (req, res) => {
    res.send("Ok");
});

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

function hasInvalidBody(body: any) {
    return iterableAnyNullOrUndefined([...Object.values(body)]);
}

/**
 * @param {Titles} titlesRepo 
 * @returns {Promise<Title>}
 */
async function getOrAddTitle(titlesRepo: Titles, {title_id, title_name, title_type, title_tags}: any) {
    let title: Title | undefined = undefined;
    
    if (title_id === 0) {
        logger.debug("[TitlesController] Title doesn't exist, creating", title_name);
        title = await titlesRepo.add(title_name, title_type, title_tags);
    } else {
        title = await titlesRepo.findById(title_id);
        
        if (!compareArrays(title.tags, title_tags)) {
            logger.debug("[TitlesController] Tags are diferent, updating title");
            await titlesRepo.updateTags(title.id, title_tags);
        }

        title.tags = title_tags;
    }

    return title;
}

/**
 * @param {Songs} songsRepo 
 */
async function ensureSongExists(songsRepo: Songs, title: Title, { song_name, youtube_id }: any) {
    const foundYtId = await songsRepo.findWithYoutubeId(youtube_id);
    if (foundYtId) {
        logger.debug("[SongsController] Youtube ID found, ignoring create", youtube_id);
        throw new AbortError("A song with the youtube ID sent already exists.", 400);
    }

    const songs: Song[] = await songsRepo.find(song_name, title.type, title.id);
    if (songs.length > 0) {
        logger.debug("[SongsController] Song name found, ignoring create", song_name);
        throw new AbortError("A song with the same name already exists.", 400);
    }
}

/**
 * @param {Songs} songsRepo 
 */
async function addSong(songsRepo: Songs, title: Title, {song_name, youtube_id}: any) {
    try {
        const serviceResponse: globalThis.Response = await fetch("http://127.0.0.1:5000/fetch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title_name: title.nameFiltered,
                song_name: filterName(song_name),
                youtube_id: youtube_id
            })
        });
        
        if (serviceResponse.status !== 201) {
            logger.error("Service song downloader not running");
            throw new AbortError("API to download songs is not available", 500);
        }
    
        const { duration, /* partial_path */ } = await serviceResponse.json();
        
        const data: any = {
            title_id: title.id,
            type: title.type,
            song_name: song_name,
            song_duration: duration,
            youtube_id: youtube_id
        };
    
        if (hasInvalidBody(data)) {
            throw new Error("Something went wrong fetching the song details");
        }
    
        const song = new Song(data);
        return songsRepo.add(song);
    } catch (err) {
        if (err instanceof TypeError) {
            logger.error("Service song downloader not running");
            throw new AbortError("API to download songs is not available", 500);
        }
    }
    
}

api.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new AbortError("Not acceptable", 406);
        }
    
        if (hasInvalidBody(req.body)) {
            throw new AbortError("Request body invalid", 400);
        }
        
        const {
            title_id, title_name, title_type, title_tags,
            song_name, youtube_id
        } = req.body;

        const titlesRepo: Titles = req.services.getRequired(Titles);
        const songsRepo: Songs = req.services.getRequired(Songs);
    
        const title = await getOrAddTitle(titlesRepo, { title_id, title_name, title_type, title_tags });
        await ensureSongExists(songsRepo, title, { song_name, youtube_id });
        
        const result = await addSong(songsRepo, title, { song_name, youtube_id });
        res.json(result);
    } catch (err) {
        next(err);
    }
});

api.use("/musics", subdomain('cdn', routers.musics));
logger.log("Route /musics enabled");

api.use("/rooms", routers.rooms);
logger.log("Route /rooms enabled");

api.use("/songs", routers.songs);
logger.log("Route /songs enabled");

api.use("/titles", routers.titles);
logger.log("Route /titles enabled");

api.use("/avatars", subdomain('cdn', routers.avatars));

const clientErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AbortError) {
        res.abort(err);
        logger.debug("Aborted request due to client error:", err.message);
    } else {
        next(err);
    }
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500);
    if (process.env.NODE_ENV == 'development') {
        res.send(`<div>
            <p>Something went wrong, sorry!</p>
            <p>${err.message + ' ' + err.stack || ''}</p>
        </div>`);
    } else {
        res.send(`
        <div>
            <p>Something went wrong, sorry!</p>
        </div>
        `);
        logger.error(err);
    }
}

api.use(clientErrorHandler);
api.use(errorHandler);
app.use("/", api);

server.listen(PORT, () => {
    logger.log(`Listening on ${PORT}`);
});