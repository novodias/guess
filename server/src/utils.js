/**
 * 
 * @param {Number} min 
 * @param {Number} max 
 * @returns 
 */
function intFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 
 * @param {Array} arr1 
 * @param {Array} arr2 
 * @returns 
 */
function compareArrays(arr1, arr2) {
    let i = arr1.length;
    if (i != arr2.length) return false;
    while (i--) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
    // return arr1.toString() === arr2.toString();
}

const search = /[':]/g
/**
 * 
 * @param {string} value 
 * @returns 
 */
function filterName(value) {
    return value
        .replace(search, "").replace(/ /g, "-")
        .toLowerCase();
}

function nullOrUndefined(value) {
    return value === null || value === undefined;
}

function iterableAnyNullOrUndefined(array) {
    if (!(array instanceof Array)) return true;

    for (const item of array) {
        if (nullOrUndefined(item)) return true;
    }

    return false;
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
};

const isDebug = process.env.NODE_ENV == 'development'

const moment = require('moment');

class Logger {
    name

    constructor(name) {
        this.name = name;
    }

    /**
     * @private
     */
    get time() {
        return moment().format("HH:mm:ss");
    }

    /**
     * @param {String} level 
     */
    formatted(level) {
        return `[${this.time}][${this.name}][${level}]:`
    }
    
    debug() {
        if (!isDebug) return;
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
        const info = this.formatted("[Error]");
        const args = [info, ...Array.prototype.slice.call(arguments)];
        console.error.apply(console, args);
    }
}

const loggerFactory = (name) => {
    // const time = () => '[' + moment().format("HH:mm:ss") + ']'; 
    // const id = '[' + name + ']';
    // const logger = {
    //     debug: function () {
    //         if (!isDebug) return;
    //         const info = time() + id + "[Debug]";
    //         const args = [info, ...Array.prototype.slice.call(arguments)];
    //         console.debug.apply(console, args);
    //     },
    //     log: function() {
    //         const info = time() + id + "[Log]";
    //         const args = [info, ...Array.prototype.slice.call(arguments)];
    //         console.log.apply(console, args);
    //     },
    //     error: function () {
    //         const info = time() + id + "[Error]";
    //         const args = [info, ...Array.prototype.slice.call(arguments)];
    //         console.error.apply(console, args);
    //     }
    // }
    // return logger;

    return new Logger(name);
};

module.exports = {
    compareArrays, intFromInterval, filterName, nullOrUndefined, iterableAnyNullOrUndefined, makeid, isDebug,
    loggerFactory, Logger
}