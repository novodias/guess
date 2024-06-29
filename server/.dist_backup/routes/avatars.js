"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const express_1 = require("express");
const config_1 = __importDefault(require("../config"));
const fs_1 = require("fs");
// import { readdir } from 'fs/promises';
const avatars = (0, express_1.Router)({ caseSensitive: true });
const avatarsPath = (0, path_1.join)(config_1.default.assetsDir, "avatars");
// const getAllAvatars = async () => {
//     const files = await readdir(avatarsPath, {
//         withFileTypes: true
//     });
//     return files.filter((v) => v.isFile())
//         .map((v) => v.name);
// }
const avatarsFiles = (function () {
    const files = (0, fs_1.readdirSync)(avatarsPath, {
        withFileTypes: true,
        recursive: false
    });
    return files
        .filter(v => v.isFile())
        .map(v => v.name);
})();
avatars.get("/all", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if (avatarsFiles === undefined) {
        //     avatarsFiles = await getAllAvatars();
        // }
        const total = avatarsFiles.length;
        res.json({ total, result: avatarsFiles });
    }
    catch (err) {
        next(err);
    }
}));
avatars.get("/:name", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        res.sendFile(name, {
            root: avatarsPath,
            extensions: ['webp', 'gif', 'jpeg', 'jpg'],
            lastModified: false
        }, (err) => {
            if (err)
                next(err);
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = avatars;
