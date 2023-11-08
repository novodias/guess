const express = require('express');
// const moment  = require('moment');
const AbortError = require('../models/abortError');
const Songs = require('../database/songs.controller');
const router  = express.Router();

router.get("/", async (req, res) => {
    const { name, type, id } = req.query;

    // if (!name) {
    //     res.status(406).send("Not acceptable - Query 'name' is empty.");
    // }
    // const nameFiltered = name.replaceAll('"', '').replaceAll("+", " ");
    // console.log(nameFiltered);

    try {
        const result = await Songs.find(name, type, id);
        
        if (result.length <= 0) {
            throw new AbortError("Not found", 404);
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// router.post("/create", async (req, res) => {
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
// router.get("/random", async (req, res) => {
//     const { total, type } = req.query;
//     const db = req.db;
//     const result = await db.get_songs_random(Number.parseInt(total), type);
//     res.json(result);
// });

module.exports = router;