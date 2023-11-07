const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
dotenv.config({ path: `.env.${process.env.NODE_ENV}`, override: true });
dotenv.config({ path: `.env.${process.env.NODE_ENV}.local`, override: true });

const PORT = process.env.PORT || 3001;

const { compareArrays, iterableAnyNullOrUndefined, loggerFactory } = require('./utils');
const express               = require('express');
const cors                  = require('cors');
const bodyParser            = require('body-parser');
const RoomsCluster          = require('./wss');
const { GuessDb, Song }     = require('./db');
const { readFileSync }      = require('fs');
const path = require('path');
const musics = require('./routes/musics');
const rooms = require('./routes/room');
const songs = require('./routes/songs');
const titles = require('./routes/titles');
const subdomain = require('express-subdomain');
const AbortError = require('./models/abortError');

const db = new GuessDb();
const logger = loggerFactory("Main");

const app = express()
    .use(cors({
        credentials: true,
        origin: ["https://ritmovu.dev", "https://api.ritmovu.dev", "https://cdn.ritmovu.dev"],
        methods: "GET, POST",
    }))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }));

const buildPath = path.join(__dirname, "client", "build");
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(buildPath));

    app.get("(/*)?", async (req, res, next) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

// app.use(function (request, response, next) {
//     if (process.env.NODE_ENV != 'development' && !request.secure) {
//         console.log("Redirected to https");
//         return response.redirect("https://" + request.headers.host + request.url);
//     }
//     next();
// });

/**
 * @param {Response<any, Record<string, any>, number>} res 
 * @param {AbortError} abortObject
 */
function abort(res, abortObject) {
    res.status(abortObject.code).json(abortObject.sanitized);
}

const api = express.Router();

api.use((req, res, next) => {
    req.db = db;
    req.cluster = cluster;
    res.abort = (abortMsg) => abort(res, abortMsg);
    next();
});

api.get("/", (req, res) => {
    res.send("Ok");
});

api.get("/secret", async (req, res, next) => {
    try {
        throw new AbortError("You found my secret page :)", 500);
    } catch (err) {
        next(err);
    }
});

api.get("/secret2", async (req, res, next) => {
    try {
        throw new Error("You found my secret2 page :)");
    } catch (err) {
        next(err);
    }
});

api.post("/error", (req, res) => {
    logger.debug(req.body);
    res.send("Ok");
});

function hasInvalidBody(body) {
    return iterableAnyNullOrUndefined([...body]);
}

async function getOrAddTitle({ title_id, title_name, title_type, title_tags }) {
    let db_Title;
    
    if (title_id === 0) {
        logger.debug("[Db/Titles] Title doesn't exist, creating", title_name);
        db_Title = (await db.add_title(title_type, title_name, title_tags))[0];
    } else {
        db_Title = (await db.get_title_by_id(title_id))[0];
        
        if (!compareArrays(db_Title.tags, title_tags)) {
            logger.debug("[Db/Titles] Tags are diferent, updating title");
            await db.update_title_tags(db_Title.id, title_tags);
        }

        db_Title.tags = title_tags;
    }

    return db_Title;
}

async function checkSong(title, { song_name, youtube_id }) {
    const songYoutubeIdFound = db.get_song_by_youtube_id(youtube_id);
    
    if (songYoutubeIdFound.length > 0) {
        logger.debug("[Db/Songs] Youtube ID found, ignoring create", youtube_id);
        // res.status(400).send("A song with the youtube ID sent already exists.");
        return {
            exists: true,
            reason: "A song with the youtube ID sent already exists."
        };
    }

    const songFound = db.get_songs_starts_with({
        name: song_name, title_id: title.id, type: title.type
    });

    if (songFound.length > 0) {
        logger.debug("[Db/Songs] Song name found, ignoring create", song_name);
        // res.status(400).send("A song with the same name already exists.");
        return {
            exists: true,
            reason: "A song with the same name already exists."
        };
    }

    return {
        exists: false,
        reason: null
    };
}

async function addSong(title, {song_name, youtube_id}) {
    const serviceResponse = await fetch("http://127.0.0.1:5000/fetch", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            title_name: song.titleNameFiltered,
            song_name: song.songNameFiltered,
            youtube_id: song.youtube_id
        }
    });
    
    if (serviceResponse.status !== 201) {
        throw new Error("Check service song downloader");
    }

    const { duration, /* partial_path */ } = await serviceResponse.json();
    
    const data = {
        title_id: title.id,
        // title_name: title.name,
        type: title.type,
        song_name: song_name,
        song_duration: duration,
        youtube_id: youtube_id
    };

    const song = new Song(data);
    return db.add_song(song);
}

api.post("/create", async (req, res, next) => {
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

        const title = await getOrAddTitle({ title_id, title_name, title_type, title_tags });
        const msg = await checkSong(title, { song_name, youtube_id });
        
        if (msg.exists) {
            throw new AbortError(msg.reason, 400);
        }
        
        const result = await addSong(title, { song_name, youtube_id });
        res.json(result);
    } catch (err) {
        next(err);
    }
});

api.use("/musics", subdomain('cdn', musics));
// api.use("/musics", musics);
logger.log("Route /musics enabled");

// api.use("/rooms", subdomain('api', rooms));
api.use("/rooms", rooms);
logger.log("Route /rooms enabled");

// api.use("/songs", subdomain('api', songs));
api.use("/songs", songs);
logger.log("Route /songs enabled");

// api.use("/titles", subdomain('api', titles));
api.use("/titles", titles);
logger.log("Route /titles enabled");

const clientErrorHandler = (err, req, res, next) => {
    if (err instanceof AbortError) {
        res.abort(err);
        logger.debug("Aborted request due to client error:", err.message);
    } else {
        next(err);
    }
}

/**
 * @param {Error} err
 */
const errorHandler = (err, req, res, next) => {
    res.status(500);
    if (process.env.NODE_ENV == 'development.local') {
        res.send(`<div>
            <p>Something went wrong, sorry!</p>
            <p>${err.stack || ''}</p>
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

let server;

if (process.env.HTTPS === 'true') {
    try {
        const options = {
            key: readFileSync(process.env.HTTPS_KEY),
            cert: readFileSync(process.env.HTTPS_CERT)
        };
    
        server = require('https').createServer(options, app);
    
        logger.log("Https enabled");
    } catch (error) {
        logger.error(error);
        server = require('http').createServer(app);
        logger.log("Something went wrong, using Http instead.");
    }
} else {
    server = require('http').createServer(app);
}

const cluster = new RoomsCluster(server, PORT);
server.listen(PORT, () => {
    logger.log(`Listening on ${PORT}`);
});

