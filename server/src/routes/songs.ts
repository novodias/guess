import { Router } from 'express';
import AbortError from '../models/abortError';
import Songs from '../database/songs.controller';

const songs: Router = Router();

interface SongRequest {
    name: string;
    type?: string;
    id: number;
}

songs.get("/", async (req, res, next) => {
    try {
        const query: SongRequest = req.query as any;
        const songsRepo: Songs = req.services.getRequired(Songs);
        const result = await songsRepo.find(query.name, query.type, query.id);
        
        if (result.length <= 0) {
            throw new AbortError("Not found", 404);
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
});

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

export default songs;