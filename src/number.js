/**
 * Format number by separating thousand division by space
 * (eg : 100000000 => 100 000 000)
 * 
 * @param {int} number
 * @returns {String} formatted number
 */
module.exports.addSpaceByThousand = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Get random integer between min value and max
 * 
 * @param {int} min
 * @param {int} max
 * @returns {int} random number
 */
module.exports.getRandomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}