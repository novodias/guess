require('dotenv').config();

const PORT = process.env.PORT || 3001;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const express       = require('express');
const cors          = require('cors');
const bodyParser    = require('body-parser');
const RoomsCluster  = require('./wss');
const database      = require('./db');
const moment        = require('moment');
const youtubeGet    = require('./youtube');

const app = express()
    .use(cors())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }));
const db = new database.GuessDb(process.env.PG_CONNECTION_STRING);

const nullUndefined = (value) => {
    return value === null || value === undefined;
}

app.post("/api/create", async (req, res) => {
    const content_type = req.get("Content-Type");
    if (content_type && content_type !== "application/json") {
        res.status(406).send("Not acceptable");
    }
    
    const { title_id, title, type, song_name, youtube_id } = req.body;

    if (title_id === null || title_id === undefined ||
        !title || !type || !song_name || !youtube_id) {
        console.log(req.body);
        res.status(400).send("Request body invalid");
        return;
    }
    
    let titleFound;
    if (title_id === 0) {
        console.log("[Db/Titles] Title doesn't exist, creating", title);
        titleFound = (await db.add_title(type, title))[0];
        
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
        const video = await youtubeGet(youtube_id, YOUTUBE_API_KEY);
        
        const duration = moment
            .duration(video.items[0].contentDetails.duration, moment.ISO_8601)
            .asSeconds();
        const song = new database.Song(titleFound.id, titleFound.type, song_name, duration, youtube_id);
        const result = await db.add_song(song);
        
        console.log(result);
        res.json(result);
    } catch (error) {
        res.status(404).send("Youtube video not found");
        console.log(error);
    }
})

app.use("/api/room/:id", (req, res, next) => {
    if (req.method === 'GET') {
        const id = req.params.id;
        const { hash } = req.query;
        const room = rooms.getRoom(id);
        console.log(id, hash);

        if (!room) {
            res.status(404).send("Not found");
            return;
        }

        if (!room.hasPassword) {
            req.room = room;
            next()
            return;
        }

        // if (room.hasPassword && (hash === null || hash === undefined)) {
        if (room.hasPassword && nullUndefined(hash)) {
            res.json(room.getRoomInformation());
            return;
        }

        if (room.passwordHash !== hash) {
            res.status(400).json({ message: "Wrong password", ...room.getRoomInformation() })
            return;
        }

        req.room = room;
    }

    next();
})

app.get("/api/room/:id", (req, res) => {
    const room = req.room;
    res.json(room.getRoomData());
});

app.post("/api/room", async (req, res) => {
    // const content_type = req.get("Content-Type");
    // if (content_type && content_type !== "application/json") {
    //     res.status(406).send("Not acceptable");
    // }

    const { name, passwordHash, isPrivate } = req.body;

    const songs = await db.get_songs_random(10);
    const room = rooms.createRoom(name, passwordHash, isPrivate, songs);
    console.log(room);

    res.json({ id: room.id, ownerId: room.ownerId });
});

app.get("/api/titles", async (req, res) => {
    const { name, type } = req.query;
    
    try {
        let result = await (type ?
            db.get_titles_starts_with_and_type(name, type) :
            db.get_titles_starts_with(name));
        
        res.json(result);
    } catch (error) {
        res.status(404).send("Not found");
        console.log(error);
    }
})

app.post("/api/titles/create", async (req, res) => {
    const { type, title } = req.body;

    const content_type = req.get("Content-Type");
    if (content_type && content_type !== "application/json") {
        res.status(406).send("Not acceptable");
    }

    try {
        const result = await db.add_title(type, title);
        res.json(result);
    } catch (error) {
        res.status(404).send("Not found");
        console.log(error);
    }
})

app.get("/api/songs", async (req, res) => {
    const { name, type, title_id } = req.query;

    // if (!name) {
    //     res.status(406).send("Not acceptable - Query 'name' is empty.");
    // }
    // const nameFiltered = name.replaceAll('"', '').replaceAll("+", " ");
    // console.log(nameFiltered);

    try {
        const result = await db.get_songs_starts_with({ name, type, title_id });
        res.json(result);
    } catch (error) {
        res.status(404).send("Not found");
        console.log(error);
    }
})

app.post("/api/songs/create", async (req, res) => {
    const {
        title_id,
        type,
        song_name,
        youtube_id
    } = req.body;
    
    const content_type = req.get("Content-Type");
    if (content_type && content_type !== "application/json") {
        res.status(406).send("Not acceptable");
    }

    // todo: verify visibility
    try {
        const video = await youtubeGet(youtube_id, YOUTUBE_API_KEY);
        
        const duration = moment
            .duration(video.items[0].contentDetails.duration, moment.ISO_8601)
            .asSeconds();
        const song = new database.Song(title_id, type, song_name, duration, youtube_id);
        const result = await db.add_song(song);
        
        res.json(result);
    } catch (error) {
        res.status(404).send("Not found");
        console.log(error);
    }
})

// temporary
app.get("/api/songs/random", async (req, res) => {
    const { total, type } = req.query;
    const result = await db.get_songs_random(Number.parseInt(total), type);
    res.json(result);
})

const server        = require('http').createServer(app);
const rooms         = new RoomsCluster(server, PORT);

server.listen(PORT, () => {
    console.log(`[Server] Listening on ${PORT}`);
});