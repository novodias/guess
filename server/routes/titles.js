const express = require('express');
const AbortError = require('../models/abortError');
const router = express.Router();

router.get("/", async (req, res) => { 
    try {
        const { name, type } = req.query;
        const db = req.db;
        
        let result = await (type ?
            db.get_titles_starts_with_and_type(name, type) :
            db.get_titles_starts_with(name));

        if (result.length <= 0) {
            throw new AbortError("Not found", 404);
        }
        
        res.json(result);
    } catch (err) {
        next(err)
    }
});

router.post("/create", async (req, res) => {
    try {
        const { type, title, tags } = req.body;
        const db = req.db;
    
        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new AbortError("Not acceptable", 406);
        }

        const result = await db.add_title(type, title, tags);
        res.json(result);
    } catch (error) {
        next(err);
    }
});

module.exports = router;