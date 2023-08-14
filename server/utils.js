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
    return arr1.toString() === arr2.toString();
}

module.exports = { compareArrays, intFromInterval }