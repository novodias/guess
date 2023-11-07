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

const loggerFactory = (name) => {
    const newName = '[' + name + ']';
    const logger = {
        debug: function () {
            if (isDebug) {
                const info = newName + "[Debug]";
                const args = [info, ...Array.prototype.slice.call(arguments)];
                console.debug.apply(console, args);
            }
        },
        log: function() {
            const info = newName + "[Log]";
            const args = [info, ...Array.prototype.slice.call(arguments)];
            console.log.apply(console, args);
        },
        error: function () {
            const info = newName + "[Error]";
            const args = [info, ...Array.prototype.slice.call(arguments)];
            console.error.apply(console, args);
        }
    }

    return logger;
};

module.exports = {
    compareArrays, intFromInterval, filterName, nullOrUndefined, iterableAnyNullOrUndefined, makeid, isDebug,
    loggerFactory
}