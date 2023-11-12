import { join } from 'path';
import { Router } from 'express';

const avatars: Router = Router({ caseSensitive: true });
if (require.main === undefined) {
    throw new Error("require main undefined");
}

const assetsPath: string = join(require.main.path, "assets");
const avatarsPath: string = join(assetsPath, "avatars");

avatars.get("/:name", async (req, res, next) => {
    try {
        const { name } = req.params;
        res.sendFile(name, {
            root: avatarsPath,
            extensions: ['webp', 'gif', 'jpeg', 'jpg']
        }, (err) => {
            if (err) next(err);
        });
    } catch (err) {
        next(err);
    }
});

export default avatars;