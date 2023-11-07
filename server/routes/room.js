const express = require('express');
const Room = require('../room');
const router = express.Router();
const { nullOrUndefined } = require('../utils');
const AbortMessage = require('../models/abortError');
const AbortError = require('../models/abortError');

/**
 * @param {Room} room
 * @param {Response<any, Record<string, any>, number>} res
 */
const ensureRoomAuthentication = (room, hash, res) => {
    if (room.hasPassword && nullOrUndefined(hash)) {
        res.json(room.public);
        console.log(`[Rooms/${room.id}] Room with password found, password not inserted`);
    }

    if (room.passwordHash !== hash) {
        console.log(`[Rooms/${room.id}] Room found, wrong authentication`);
        throw new AbortMessage("Room's password doesn't match", 400, room.public);
    }
}

router.use("/", (req, res, next) => {
    try {
        if (req.method === 'GET') {
            const { id } = req.query;
            const authorization = req.headers.authorization;
            const hash = Buffer.from(authorization, 'base64').toString('ascii');
            const room = req.cluster.getRoom(id);
            req.room = room;
    
            if (!room) {
                console.log("[Rooms] Couldn't found room", id);
                throw new AbortMessage("Room not found", 404);
            }
            
            if (room.hasPassword) {
                ensureRoomAuthentication(room, hash, res);
            }
        }
    
        next();
    } catch (err) {
        next(err);
    }
})

router.get("/", (req, res) => {
    /**
     * @type {Room}
     */
    const room = req.room;
    res.json(room.private);
});

router.post("/", async (req, res, next) => {
    try {
        const content_type = req.get("Content-Type");
        if (!content_type || content_type !== "application/json") {
            throw new AbortError("Content type not acceptable", 406);
        }
    
        const { name, passwordHash, isPrivate } = req.body;
        const db = req.db;
        const cluster = req.cluster;
    
        const songs = await db.get_songs_random(10);
        const room = cluster.createRoom(name, passwordHash, isPrivate, songs);
    
        res.json({ id: room.id, ownerId: room.ownerId });
    } catch (err) {
        next(err);
    }
});

module.exports = router;