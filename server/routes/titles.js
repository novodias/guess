const express = require('express');
const AbortError = require('../models/abortError');
const Titles = require('../database/titles.controller');
const { loggerFactory } = require('../utils');
const router = express.Router();
const logger = loggerFactory("RouterTitles");

router.get("/", async (req, res, next) => { 
    try {
        const { name, type } = req.query;
        let result = await (type === undefined ? Titles.find : Titles.findWithType)(name, type);
        res.json(result);
    } catch (err) {
        next(err)
    }
});

router.post("/create", async (req, res, next) => {
    try {
        const { type, title, tags } = req.body;
    
        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new AbortError("Not acceptable", 406);
        }

        const result = await Titles.add(title, type, tags);
        res.json(result);
    } catch (error) {
        next(err);
    }
});

module.exports = router;