require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const PORT = process.env.PORT || 3001;

const express               = require('express');
const cors                  = require('cors');
const bodyParser            = require('body-parser');
const RoomsCluster          = require('./wss');
const { GuessDb, Song }     = require('./db');
const moment                = require('moment');
const youtubeGet            = require('./youtube');
const { readFileSync }      = require('fs');
const path                  = require('path');

const db = new GuessDb();

const app = express()
    .use(cors())
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

const api = express.Router();

api.use((req, res, next) => {
    req.db = db;
    req.cluster = cluster;
    next();
});

api.get("/", (req, res) => {
    res.send("OK");
});

api.post("/error", (req, res) => {
    console.log(req.body);
});

api.post("/create", async (req, res) => {
    const content_type = req.get("Content-Type");
    if (content_type && content_type !== "application/json") {
        res.status(406).send("Not acceptable");
    }
    
    const { title_id, title_name, title_type, title_tags,
        song_name, youtube_id } = req.body;

    if (title_id === null || title_id === undefined ||
        !title || !type || !song_name || !youtube_id) {
        console.log(req.body);
        res.status(400).send("Request body invalid");
        return;
    }
    
    let titleFound;
    if (title_id === 0) {
        console.log("[Db/Titles] Title doesn't exist, creating", title);
        titleFound = (await db.add_title(type, title, tags))[0];
        
    } else {
        titleFound = (await db.get_title_by_id(title_id))[0];
    }

    const songYoutubeIdFound = await db.get_song_by_youtube_id(youtube_id);

    if (songYoutubeIdFound.length > 0) {
        console.log("[Db/Songs] Youtube ID found, ignoring create", youtube_id);
        res.status(400).send("A song with the youtube ID sent already exists.");
        return;
    }

    const songFound = await db.get_songs_starts_with({
        name: song_name, title_id: titleFound.id, type: titleFound.type
    });

    if (songFound.length > 0) {
        console.log("[Db/Songs] Song name found, ignoring create", song_name);
        res.status(400).send("A song with the same name already exists.");
        return;
    }

    try {
        const video = await youtubeGet(youtube_id);
        
        const duration = moment
            .duration(video.items[0].contentDetails.duration, moment.ISO_8601)
            .asSeconds();
        const song = new Song(titleFound.id, titleFound.type, song_name, duration, youtube_id);
        const result = await db.add_song(song);
        
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(404).send("Youtube video not found");
        console.log(error);
    }
});

const rooms = require('./routes/room');
const songs = require('./routes/songs');
const titles = require('./routes/titles');

api.use("/rooms", rooms);
api.use("/songs", songs);
api.use("/titles", titles);

app.use("/api", api);

let server;

if (process.env.NODE_ENV === 'production') {
    try {
        const options = {
            key: readFileSync(process.env.HTTPS_KEY),
            cert: readFileSync(process.env.HTTPS_CERT)
        };
    
        server = require('https').createServer(options, app);
    
        console.log("Https enabled");
    } catch (error) {
        console.error(error);
        server = require('http').createServer(app);
        console.log("Something went wrong, using Http instead.");
    }
} else {
    server = require('http').createServer(app);
}

// const server        = require('http').createServer(app);
const cluster = new RoomsCluster(server, PORT);

server.listen(PORT, () => {
    console.log(`[Server] Listening on ${PORT}`);
});

