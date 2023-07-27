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

app.get("/api/room/get/:id", (req, res) => {
    const id = req.params.id;
    const room = rooms.getRoom(id);

    if (room) {
        res.json(room.getRoomData());
        return;
    }

    res.status(404).send("Not found");
});

app.get("/api/room/create", (req, res) => {
    const id = rooms.createRoom();
    res.send(id);
});

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

    // const song = {
    //     title_id,
    //     type,
    //     song_name,
    //     youtube_id
    // };

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

const server        = require('http').createServer(app);
const rooms         = new RoomsCluster(server, PORT);

server.listen(PORT, () => {
    console.log(`[Server] Listening on ${PORT}`);
});