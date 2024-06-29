"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerFactory = void 0;
const moment_1 = __importDefault(require("moment"));
const utils_1 = require("./utils");
class Logger {
    constructor(name) {
        this.name = name;
    }
    get time() {
        return (0, moment_1.default)().format("HH:mm:ss");
    }
    formatted(level) {
        return `[${this.time}][${this.name}][${level}]:`;
    }
    debug() {
        if (!utils_1.isDebug)
            return;
        const info = this.formatted("Debug");
        const args = [info, ...Array.prototype.slice.call(arguments)];
        console.debug.apply(console, args);
    }
    log() {
        const info = this.formatted("Info");
        const args = [info, ...Array.prototype.slice.call(arguments)];
        console.log.apply(console, args);
    }
    error() {
        const info = this.formatted("Error");
        const args = [info, ...Array.prototype.slice.call(arguments)];
        console.error.apply(console, args);
    }
}
const loggerFactory = (name) => {
    return new Logger(name);
};
exports.loggerFactory = loggerFactory;
