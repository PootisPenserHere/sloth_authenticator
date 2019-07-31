"use strict";

/**
 * Helper to interact with the redis database through the async await api
 *
 * @module redisService
 */

const Redis = require("ioredis");
const redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    family: 4, // 4 (IPv4) or 6 (IPv6)
    password: process.env.REDIS_PASSWORD,
    db: 0,
    showFriendlyErrorStack: true
});

redis.on("connect", function () {
    console.log(`successfully connected to the redis server at ${process.env.REDIS_HOST}`);
});

redis.on("error", function (err) {
    console.log(`an error occurred while trying to connect to redis caused by: ${err}`);
});

/**
 * Creates a new key in redis with a default time to live and the option to
 * set a custom time
 *
 * @function
 * @name setKey
 * @param {string} key Name of the key to create
 * @param {string} value The contents of the new key
 * @param {int} [ttl] Time to live of the key in seconds, defaults to process.env.REDIS_DEFAULT_TTL
 * @returns {Promise<string>}
 */
async function setKey(key, value, ttl=process.env.REDIS_DEFAULT_TTL) {
    try {
        return await redis.set(key, value, 'EX', ttl);
    } catch(err) {
        console.log(`error on redis.setKey() caused by ${err}`);
        throw Error("An error occurred while saving to cache, please contact the system administrator.");
    }
}

/**
 * Wrapper function to store objects in redis
 *
 * @function
 * @name setJsonKey
 * @param {string} key Name of the key to create
 * @param {object} value The contents of the new key
 * @param {int} [ttl] Time to live of the key in seconds, defaults to process.env.REDIS_DEFAULT_TTL
 * @returns {Promise<string>}
 */
async function setJsonKey(key, value, ttl=process.env.REDIS_DEFAULT_TTL) {
    return await setKey(key, JSON.stringify(value), ttl)
}

/**
 * Retrieves a key value from redis
 *
 * The output has some quirks when handling data separated by white spaces such as a json
 * for that use cause it's best to use the getJsonKey method
 *
 * @function
 * @name getKey
 * @param {string} key Name of the key to query
 * @returns {Promise<string|null>} The value of the key or null if not found
 */
async function getKey(key) {
    try {
        return await redis.get(key);
    } catch(err) {
        console.log(`error on redis.getKey() caused by ${err}`);
        throw Error("An error occurred while retrieving from cache, please contact the system administrator.");
    }
}

/**
 *  Wrapper to retrieve json objects from redis
 *
 *  As they're converted into a string for storage this method will convert them into object
 *
 * @function
 * @name getJsonKey
 * @param {string} key Name of the key to query
 * @returns {Promise<object|null>} The value of the key or null if not found
 */
async function getJsonKey(key) {
    let output = await getKey(key);
    return JSON.parse(output);
}

/**
 * Deletes a key from redis
 *
 * @function
 * @name deleteKey
 * @param {string} key Name of the key to delete
 * @returns {Promise<string>}
 */
async function deleteKey(key) {
    try {
        return await redis.del(key);
    } catch(err) {
        console.log(`error on redis.deleteKey() caused by ${err}`);
        throw Error("An error occurred while deleting from cache, please contact the system administrator.");
    }
}

/**
 * Checks the time to live of a given key
 *
 * @function
 * @name getTtl
 * @param {string} key Name of the key to query
 * @returns {Promise<int>} Remaining time in seconds for the key to stay in cache
 */
async function getTtl(key) {
    try {
        return await redis.ttl(key);
    } catch(err) {
        console.log(`error on redis.getTtl() caused by ${err}`);
        throw Error("An error occurred while getting the ttl of a key from cache, please contact the system administrator.");
    }
}

/**
 * Increases the value of an key by one, if the key doesn't exist it'll be created, initialized at zero and then
 * be incremented, resulting in a 1
 *
 * @function
 * @name increaseKeyValue
 * @param {string} key Name of the key to modify
 * @param increment {int} multiplier for the increment, defaults to 1
 * @returns {Promise<int>} The new value after the increment
 */
async function increaseKeyValue(key, increment=1) {
    try {
        return await redis.incr(key, increment);
    } catch(err) {
        console.log(`error on redis.increaseKeyValue() caused by ${err}`);
        throw Error("An error occurred while increasing counter from cache, please contact the system administrator.");
    }
}

/**
 * Decreases the value of a key by one, if the key doesn't exist it'll be created, initialized at zero and then
 * decreased resulting in a negative number being returned
 *
 * @function
 * @name decrementKeyValue
 * @param {string} key Name of the key to modify
 * @param {int} decrement Amount to decrement to the value, defaults to 1
 * @returns {Promise<int>} The value after the decrement
 */
async function decrementKeyValue(key, decrement=1) {
    try {
        return await redis.decr(key, decrement)
    } catch(err) {
        console.log(`error on redis.decrementKeyValue() caused by ${err}`);
        throw Error("An error occurred while decreasing counter from cache, please contact the system administrator.");
    }
}

module.exports.setKey = setKey;
module.exports.setJsonKey = setJsonKey;
module.exports.getKey = getKey;
module.exports.getJsonKey = getJsonKey;
module.exports.deleteKey = deleteKey;
module.exports.getTtl = getTtl;
module.exports.increaseKeyValue = increaseKeyValue;
module.exports.decrementKeyValue = decrementKeyValue;
