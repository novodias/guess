import { Router, Response, Request, NextFunction } from "express";
import Room, { RoomConfig } from '../room';
import { nullOrUndefined } from '../utils';
import AbortMessage from '../models/abortError';
import AbortError from '../models/abortError';
import Songs from '../database/songs.controller';

const rooms: Router = Router();

rooms.get("/all", async (req, res, next) => {
    try {
        const start = parseInt(req.query.start as string);
        const count = parseInt(req.query.count as string);
        const object = req.cluster.getRooms(start, count);
        res.json(object);
    } catch (err) {
        next(err);
    }
});

rooms.get("/find", async (req, res, next) => {
    try {
        const { name } = req.query;
        const rooms = req.cluster.query(name as string);
        res.json(rooms);
    } catch (err) {
        next(err);
    }
});

const ensureRoomAuthentication = (room: Room, hash: string, res: Response) => {
    if (nullOrUndefined(hash)) {
        res.json(room.public);
        console.log(`[Rooms/${room.id}] Room with password found, password not inserted`);
    }

    if (room.password !== hash) {
        console.log(`[Rooms/${room.id}] Room found, wrong authentication`);
        throw new AbortMessage("Room's password doesn't match", 400, {...room.public, message: "Password doesn't match"});
    }
}

rooms.use("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.method === 'GET') {
            const id = req.query.id as string;
            const authorization = req.headers.authorization;

            const hash = Buffer.from(authorization || "", 'base64').toString('ascii');
            const room = req.cluster!.getRoom(id);
            
            if (!room) {
                console.log("[Rooms] Couldn't found room", id);
                throw new AbortMessage("Room not found", 404);
            }
            
            req.room = room;
            
            if (room.hasPassword) {
                ensureRoomAuthentication(room, hash, res);
            }
        }
    
        next();
    } catch (err) {
        next(err);
    }
})

rooms.get("/", (req: Request, res: Response) => {
    const room = req.room;
    res.json(room!.private);
});

rooms.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const content_type = req.get("Content-Type");
        if (!content_type || content_type !== "application/json") {
            throw new AbortError("Content type not acceptable", 406);
        }
    
        const config: RoomConfig = req.body;
        const cluster = req.cluster;
        const songsRepo = req.services.getRequired<Songs>(Songs);
    
        const songs = await songsRepo.random(10);
        const roomInfo = cluster!.createRoom(config, songs);
        res.json(roomInfo);
    } catch (err) {
        next(err);
    }
});

export default rooms;