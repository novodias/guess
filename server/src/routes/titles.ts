import { Router } from 'express';
import AbortError from '../models/abortError';
import Titles from '../database/titles.controller';
import Title from '../models/title.model';

const titles: Router = Router();

interface TitleQuery {
    name: string;
    type?: string;
}

titles.get("/", async (req, res, next) => { 
    try {
        const query: TitleQuery = req.query as any;
        const titlesRepo: Titles = req.services.getRequired(Titles);

        let result: Title[] | undefined = undefined;
        if (query.type === undefined) {
            result = await titlesRepo.find(query.name);
        } else {
            result = await titlesRepo.findWithType(query.name, query.type);
        }
        
        res.json(result);
    } catch (err) {
        next(err)
    }
});

titles.post("/create", async (req, res, next) => {
    try {
        const { type, title, tags } = req.body;
    
        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new AbortError("Not acceptable", 406);
        }
        
        const titlesRepo: Titles = req.services.getRequired(Titles);
        const result = await titlesRepo.add(title, type, tags);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default titles;