import { Router } from 'express';
import AbortError from '../models/abortError';
import { TitleType } from '../services/titles.service';

const titles: Router = Router();

interface TitleQuery {
    name: string;
    type?: string;
}

titles.get("/", async (req, res, next) => { 
    try {
        const query: TitleQuery = req.query as any;
        const result = await req.titles.find(query.name, query.type);
        res.json(result);
    } catch (err) {
        next(err)
    }
});

titles.post("/", async (req, res, next) => {
    try {
        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new AbortError("Not acceptable", 406);
        }
        
        const { type, title, tags } = req.body;
        const result = await req.titles.register({ name: title, tags, type });
        if (!result.registered) throw new AbortError("Cannot register the title", 406);
        res.json(result.title);
    } catch (err) {
        next(err);
    }
});

titles.patch("/:id", async (req, res, next) => {
    try {
        if (typeof req.params.id === 'undefined') {
            throw new AbortError("Id was not specified", 406);
        }

        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new AbortError("Not acceptable", 406);
        }

        const id = parseInt(req.params.id);
        const changes: { name?: string, type?: TitleType, tags?: string[] } = req.body;
        const result = await req.titles.update(id, changes);
        res.json({ success: result });
    } catch (err) {
        next(err)
    }  
})

export default titles;