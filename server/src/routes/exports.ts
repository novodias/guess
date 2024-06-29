import http from 'http';
import https from 'https';
import express, { Application, Request, Response, NextFunction } from "express";
import avatars from "./avatars";
import musics from "./musics";
import rooms from "./rooms";
import songs from "./songs";
import titles from "./titles";
import RoomsCluster from "../cluster";
import AbortError from "../models/abortError";
import { loggerFactory } from '../logger';
import TitlesService from '../services/titles.service';
import SongsService from '../services/songs.service';

const logger = loggerFactory("Api");

function mountRoutes(server: http.Server | https.Server, app: Application) {
    function abort(res: Response, abortObject: AbortError) {
        res.status(abortObject.code);
        res.json(abortObject.sanitized);
    }
    
    const api = express.Router();
    
    api.use((req: Request, res: Response, next: NextFunction) => {
        req.cluster = new RoomsCluster(server);
        req.titles = new TitlesService();
        req.songs = new SongsService();
        res.abort = (abortMsg: AbortError) => abort(res, abortMsg);
        next();
    });
    
    api.post("/error", (req, res) => {
        logger.log(req.body);
        res.send("Ok");
    });
    
    api.use("/musics", musics);
    api.use("/rooms", rooms);
    api.use("/songs", songs);
    api.use("/titles", titles);
    api.use("/avatars", avatars);
    
    const clientErrorHandler = (err: Error, _: Request, res: Response, next: NextFunction) => {
        if (err instanceof AbortError) {
            res.abort(err);
            logger.debug("Aborted request due to client error:", err.message);
        } else {
            next(err);
        }
    }
    
    const errorHandler = (err: Error, _: Request, res: Response) => {
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
    app.use("/api", api);
}

// const routers = { avatars, musics, rooms, songs, titles } 
export default mountRoutes;