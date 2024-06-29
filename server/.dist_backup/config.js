"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ensureNotUndefined(value) {
    const key = Object.keys({ value })[0];
    if (value === undefined) {
        throw new Error(key + " must not be undefined");
    }
    return value;
}
const config = {
    assetsDir: ensureNotUndefined(process.env.ASSETS_DIRECTORY),
};
exports.default = config;
