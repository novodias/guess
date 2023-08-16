const express = require('express');
const router = express.Router();

const nullUndefined = (value) => {
    return value === null || value === undefined;
}

router.use("/", (req, res, next) => {
    if (req.method === 'GET') {
        const { id } = req.query;
        const authorization = req.headers.authorization;
        const hash = Buffer.from(authorization, 'base64').toString('ascii');
        const room = req.cluster.getRoom(id);
        // console.log(room.passwordHash, hash, room.passwordHash === hash);

        if (!room) {
            res.status(404).send("Not found");
            console.log("[Rooms] Couldn't found room", id);
            return;
        }

        if (!room.hasPassword) {
            req.room = room;
            console.log(`[Rooms/${room.id}] Room found, password not needed`);
            next()
            return;
        }

        if (room.hasPassword && nullUndefined(hash)) {
            res.json(room.getRoomInformation());
            console.log(`[Rooms/${room.id}] Room found, password NEEDED`);
            return;
        }

        if (room.passwordHash !== hash) {
            console.log(`[Rooms/${room.id}] Room found, wrong authentication`);
            res.status(400).json({
                message: "Wrong password",
                ...room.getRoomInformation()
            })
            return;
        }

        req.room = room;
    }

    next();
})

router.get("/", (req, res) => {
    const room = req.room;
    res.json(room.getRoomData());
});

router.post("/", async (req, res) => {
    const content_type = req.get("Content-Type");
    if (content_type && content_type !== "application/json") {
        res.status(406).send("Not acceptable");
    }

    console.log(req.body);
    const { name, passwordHash, isPrivate } = req.body;
    const db = req.db;
    const cluster = req.cluster;

    const songs = await db.get_songs_random(10);
    const room = cluster.createRoom(name, passwordHash, isPrivate, songs);
    console.log(room);

    res.json({ id: room.id, ownerId: room.ownerId });
});

module.exports = router;