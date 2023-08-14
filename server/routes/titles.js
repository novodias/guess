const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    const { name, type } = req.query;
    const db = req.db;
    
    try {
        let result = await (type ?
            db.get_titles_starts_with_and_type(name, type) :
            db.get_titles_starts_with(name));
        
        res.json(result);
    } catch (error) {
        res.status(404).send("Not found");
        console.log(error);
    }
});

router.post("/create", async (req, res) => {
    const { type, title, tags } = req.body;
    const db = req.db;

    const content_type = req.get("Content-Type");
    if (content_type && content_type !== "application/json") {
        res.status(406).send("Not acceptable");
    }

    try {
        const result = await db.add_title(type, title, tags);
        res.json(result);
    } catch (error) {
        res.status(404).send("Not found");
        console.log(error);
    }
});

module.exports = router;