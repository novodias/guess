const express = require('express');
const Room = require('../room');
const router = express.Router();
const { nullOrUndefined } = require('../utils');
const AbortMessage = require('../models/abortError');

/**
 * @param {Room} room
 * @param {Response<any, Record<string, any>, number>} res
 */
const ensureRoomAuthentication = (room, hash, res) => {
    if (room.hasPassword && nullOrUndefined(hash)) {
        res.json(room.public);
        console.log(`[Rooms/${room.id}] Room with password found, password not inserted`);
        return false;
    }

    if (room.passwordHash !== hash) {
        console.log(`[Rooms/${room.id}] Room found, wrong authentication`);
        const abt = new AbortMessage("Room's password doesn't match", 400, room.public);
        res.abort(abt);
        return false;
    }

    return true;
}

router.use("/", (req, res, next) => {
    if (req.method === 'GET') {
        const { id } = req.query;
        const authorization = req.headers.authorization;
        const hash = Buffer.from(authorization, 'base64').toString('ascii');
        /**
         * @type {Room}
         */
        const room = req.cluster.getRoom(id);
        // console.log(room.passwordHash, hash, room.passwordHash === hash);

        if (!room) {
            console.log("[Rooms] Couldn't found room", id);
            res.abort(new AbortMessage("Room not found", 404));
            return;
        }

        if (!room.hasPassword) {
            req.room = room;
            console.log(`[Rooms/${room.id}] Room found, password not needed`);
            next()
            return;
        }

        if (!ensureRoomAuthentication(room, hash, res)) {
            return;
        }

        req.room = room;
    }

    next();
})

router.get("/", (req, res) => {
    // auth part gone
    /**
     * @type {Room}
     */
    const room = req.room;
    res.json(room.private);
});

router.post("/", async (req, res) => {
    const content_type = req.get("Content-Type");
    if (content_type && content_type !== "application/json") {
        res.status(406).send("Not acceptable");
    }

    const { name, passwordHash, isPrivate } = req.body;
    const db = req.db;
    const cluster = req.cluster;

    const songs = await db.get_songs_random(10);
    const room = cluster.createRoom(name, passwordHash, isPrivate, songs);

    res.json({ id: room.id, ownerId: room.ownerId });
});

module.exports = router;