/**
 * prepends a '0' to the start of the rating if it is a single digit
 * @param {number} rating
 * @returns {string} the rating as a string
 */
const padRating = rating => {
    let ratingStr = rating.toString();

    if (ratingStr.length === 1) {
        ratingStr = `0${ratingStr}`;
    }

    return ratingStr;
};

/**
 * Generates a CSS class that fills the ratings stars based on the rating given
 * @param {Number} mean
 * @returns {String} - the CSS class to fill the ratings stars
 */
// TODO: memoize this
const ratingClass = mean => {
    if (typeof mean !== 'number') {
        return '';
    }

    let ratingAmount = '00';

    if (mean !== 0) {
        ratingAmount = Math.round(mean * 10);
    }

    return `c-ratings--fill-${padRating(ratingAmount)}`;
};

export default {
    ratingClass
};

