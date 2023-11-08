const {join, dirname} = require('path');
const {Router} = require('express');

const router = Router({ caseSensitive: true });
const appDir = dirname(require.main.filename);
const avatarsPath = join(appDir, "assets", "avatars");

router.get("/:name", async (req, res, next) => {
    try {
        const { name } = req.params;
        res.sendFile(name, {
            root: avatarsPath,
            extensions: ['webp', 'gif']
        }, (err) => {
            if (err) {
                next(err);
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;