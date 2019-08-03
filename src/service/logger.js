"use strict";

/**
 * Logger class to be used through the application
 *
 * @module logger
 */


const winston = require('winston');
const { combine, timestamp, label, prettyPrint, printf } = winston.format;
const httpContext = require('express-http-context');
require("winston-daily-rotate-file");

const jsonFormatter = (logEntry) => {
    const base = { timestamp: new Date(), requestId: httpContext.get('requestId') };
    const json = Object.assign(base, logEntry);
    logEntry[Symbol.for('message')] = JSON.stringify(json);
    return logEntry;
};

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

if (process.env.DEV_MODE === 'true') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports.logger = logger;
