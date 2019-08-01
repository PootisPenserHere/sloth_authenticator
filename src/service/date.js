"use strict";

/**
 * Generic helper for any date and time related functionality
 *
 * @module dateService
 */

/**
 * Compares the current time with a given timestamp to determine how many seconds are left
 * until the date is reached
 *
 * @param {int} timestamp A timestamp date
 * @returns {Promise<number>} Time in seconds left until the timestamp date is reached
 */
async function secondsLeftTillTimestamp(timestamp) {
    return timestamp - Math.floor(Date.now() / 1000);
}

module.exports.secondsLeftTillTimestamp = secondsLeftTillTimestamp;