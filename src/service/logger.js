"use strict";

/**
 * Logger class to be used through the application
 *
 * @module logger
 */


const winston = require('winston');
const { combine, timestamp, label, prettyPrint, printf } = winston.format;
require("winston-daily-rotate-file");

const logger = winston.createLogger({
    format: combine(timestamp(), winston.format.json()),
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
