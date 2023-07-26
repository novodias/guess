const PORT = process.env.PORT || 3001;

const express = require('express');
const RoomsCluster = require('./wss');
const cors = require('cors');

const app = express();
app.use(cors());
const rooms = new RoomsCluster();

app.get("/api/room/get/:id", (req, res) => {
    const id = req.params.id;
    const room = rooms.getRoom(id);

    if (room) {
        res.json(room.getRoomData());
        return;
    }

    res.status(404).send("Not found");
})

app.get("/api/room/create", (req, res) => {
    const id = rooms.createRoom();
    res.send(id);
});

app.listen(PORT, () => {
    console.log(`[Http] Server listening on ${PORT}`);
});