import { join } from 'path';
import { Router } from 'express';
import config from '../config';
import { readdirSync } from 'fs';
// import { readdir } from 'fs/promises';

const avatars: Router = Router({ caseSensitive: true });
const avatarsPath: string = join(config.assetsDir, "avatars");

// const getAllAvatars = async () => {
//     const files = await readdir(avatarsPath, {
//         withFileTypes: true
//     });

//     return files.filter((v) => v.isFile())
//         .map((v) => v.name);
// }

const avatarsFiles: string[] = (function () {
    const files = readdirSync(avatarsPath, {
        withFileTypes: true,
        recursive: false
    });

    return files
        .filter(v => v.isFile())
        .map(v => v.name);
})();

avatars.get("/all", async (req, res, next) => {
    try {
        // if (avatarsFiles === undefined) {
        //     avatarsFiles = await getAllAvatars();
        // }

        const total = avatarsFiles.length;
        res.json({ total, result: avatarsFiles });
    } catch (err) {
        next(err);
    }
});

avatars.get("/:name", async (req, res, next) => {
    try {
        const { name } = req.params;
        res.sendFile(name, {
            root: avatarsPath,
            extensions: ['webp', 'gif', 'jpeg', 'jpg'],
            lastModified: false
        }, (err) => {
            if (err) next(err);
        });
    } catch (err) {
        next(err);
    }
});

export default avatars;