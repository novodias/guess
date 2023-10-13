const path = require("path");
const fs = require("fs")
const express = require('express');
const router = express.Router();

const MUSICS_DIRECTORY = process.env.MUSIC_DIRECTORY;
const music = (title, name) => path.join(MUSICS_DIRECTORY, title, name) + '.m4a';
const checkAsync = (path) => new Promise((resolve, reject) => {
    fs.stat(path, function (err, stat) {
        if (err == null) {
            resolve(null);
        } else {
            reject(err);
            // console.log("Error trying to found music file: ", err.message, err.code);
        }
    });
});

router.get("/:title/:name", async (req, res) => {
    const {title, name} = req.params;
    const musicPath = music(title, name);

    try {
        // throws a error if the file doesn't exist
        await checkAsync(musicPath);
        res.type("audio/mp4");
        res.sendFile(musicPath);
        // res.send(musicPath);
    } catch (error) {
        res.status(404).send("Not found LOL");
        console.log("Error trying to found music file: ", error.message, error.code);
    }
});

module.exports = router;