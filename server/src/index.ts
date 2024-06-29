import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: `.env.${process.env.NODE_ENV}`, override: true });
dotenv.config({ path: `.env.${process.env.NODE_ENV}.local`, override: true });

import https from 'https'
import http from 'http'
import express, { Application } from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import path from 'path';
import { loggerFactory } from './logger';
import mountRoutes from './routes/exports';

const PORT: number = parseInt(process.env.PORT || "3001");
const logger = loggerFactory("Main");
const app: Application = express()
    .use(cors({
        credentials: false,
        // origin: ["https://ritmovu.dev", "https://api.ritmovu.dev", "https://cdn.ritmovu.dev"],
        methods: "GET, POST, PATCH, DELETE",
    }))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(process.env.DIST_BUILD as string);
    app.use(express.static(buildPath));
    app.get("/", async (_, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

let server;
if (process.env.HTTPS === 'true') {
    try {
        const options: https.ServerOptions = {
            key: readFileSync(process.env.HTTPS_KEY || ""),
            cert: readFileSync(process.env.HTTPS_CERT || ""),
        };
    
        server = https.createServer(options, app);
    
        logger.log("Https enabled");
    } catch (error) {
        logger.error(error);
        server = http.createServer(app);
        logger.log("Something went wrong, using Http instead.");
    }
} else {
    server = http.createServer(app);
}

mountRoutes(server, app);

server.listen(PORT, () => {
    logger.log(`Listening on ${PORT}`);
});