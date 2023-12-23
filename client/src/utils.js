const _env = process.env.NODE_ENV;
export default class logger {
    /**
     * 
     * @param {("debug"|"info")} level 
     * @param {*} message 
     */
    static log(level, callback) {
        const _logHandler = {
            "debug": () => {
                if (_env === "development") {
                    callback();
                }
            },
            "info": () => {
                callback();
            }
        }
    
        _logHandler[level]();
    }
    
    static debug() {
        const args = [...arguments];
        this.log("debug", () => console.log("[DEBUG]", ...args));
    }
}

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function next(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * @param {number} min 
 * @param {number} max 
 * @param {number} value 
 * @returns {number}
 */
export function clamp(min, max, value) {
    return Math.min(Math.max(value, min), max);
}

export function noop() { }

export function wait(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

export function classFilter(className) {
    return className ? " " + className : "";
}