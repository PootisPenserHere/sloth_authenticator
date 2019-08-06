"use strict";

/**
 * Logger class to be used through the application
 *
 * @module logger
 */


const winston = require('winston');
const httpContext = require('express-http-context');
require("winston-daily-rotate-file");

/**
 * Converts a log object into a custom format which adds the requestId so that each request
 * made to the api can be linked to a series of steps taken
 *
 * @param {object} logEntry Contains the log object that will be formatted for output
 * @returns {object} A Json formatted log in the given log object
 */
const jsonFormatter = (logEntry) => {
    const base = { timestamp: new Date(), requestId: httpContext.get('requestId') };
    const json = Object.assign(base, logEntry);
    logEntry[Symbol.for('message')] = JSON.stringify(json);
    return logEntry;
};

// Initiates the logger with the custom formatter
const logger = winston.createLogger({
    format: winston.format(jsonFormatter)(),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: "sloth_authenticator-%DATE%.log.json",
            datePattern: "YYYY-MM-DD",
            dirname: "logs",
            zippedArchive: true,
            maxFiles: "90d",
        })
    ]
});

// If DEV_MODE is enabled the basic logger output will also be pipped to consoles
if (process.env.DEV_MODE === 'true') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports.logger = logger;
