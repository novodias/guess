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
const express_1 = require("express");
const abortError_1 = __importDefault(require("../models/abortError"));
const titles_controller_1 = __importDefault(require("../database/titles.controller"));
const titles = (0, express_1.Router)();
titles.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const titlesRepo = req.services.getRequired(titles_controller_1.default);
        let result = undefined;
        if (query.type === undefined) {
            result = yield titlesRepo.find(query.name);
        }
        else {
            result = yield titlesRepo.findWithType(query.name, query.type);
        }
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}));
titles.post("/create", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, title, tags } = req.body;
        const content_type = req.get("Content-Type");
        if (content_type && content_type !== "application/json") {
            throw new abortError_1.default("Not acceptable", 406);
        }
        const titlesRepo = req.services.getRequired(titles_controller_1.default);
        const result = yield titlesRepo.add(title, type, tags);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}));
exports.default = titles;
