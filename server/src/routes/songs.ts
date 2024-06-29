import { Router } from 'express';
import AbortError from '../models/abortError';
import { SongData } from '../services/songs.service';
import { TitleType } from '../services/titles.service';

const songs: Router = Router();

interface SongRequest {
    name: string;
    type?: string;
    id: number;
}

songs.get("/", async (req, res, next) => {
    try {
        const query: SongRequest = req.query as any;
        const result = await req.songs.find(query.name, query.type);

        if (result.length <= 0) {
            throw new AbortError("Not found", 404);
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
});

songs.post("/", async (req, res, next) => {
    try {
        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            res.status(406).send("Not acceptable");
        }

        const data: SongData = req.body;
        const result = await req.songs.register(data);
        if (!result.registered) throw new AbortError("Cannot register the song", 406);
        res.json(result.song);
    } catch (err) {
        next(err);
    }
})

songs.patch("/:id", async (req, res, next) => {
    try {
        if (typeof req.params.id === 'undefined') {
            throw new AbortError("Id was not specified", 406);
        }

        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new AbortError("Not acceptable", 406);
        }

        const id = parseInt(req.params.id);
        const changes: {
            name?: string,
            type?: TitleType,
            duration?: number,
            youtube_id?: string,
            title_id?: number
        } = req.body;
        const result = await req.songs.update(id, changes);
        res.json({ success: result });
    } catch (err) {
        next(err);
    }
})

export default songs;