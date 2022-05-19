const numeral = require('numeral');

/**
 * Formats a string to a number e.g. "1,000" to 1000, "200K" to 200000
 * @param {string} str 
 * @returns number
 */
module.exports.toNumber = function toNumber(str) {
    let multiplier = str.substr(-1).toLowerCase();
    if (multiplier == "k")
        return numeral(str).value() * 1000;
    else if (multiplier == "m")
        return numeral(str).value() * 1000000;
    else
        return numeral(str).value();
}
