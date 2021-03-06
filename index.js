"use strict";

require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const cors = require('cors');
const mung = require('express-mung');

const genericErrorHandling = require('./src/middleware/genericErrorHandler');
const requestIdGeneratorMiddleware = require('./src/middleware/requestIdGenerator');
const { tokenValidator, handledValidationError, scopeChecker, handledNoPermissionsError } = require("./src/middleware/tokenValidation");
const { logEntryRoute } = require("./src/middleware/logEntryRoute");
const clientApplication = require('./src/application/client');
const userApplication = require('./src/application/user');
const bootstrapApplication = require('./src/application/bootstrap');
const loggerService = require('./src/service/logger');

const app = express();

/*
 * Enable cors
 */
app.use(cors());
app.options('*', cors());

/*
 * Parses the request body into a json
 */
app.use(bodyParser.json());

/*
 * Run the context for each request. Assign a unique identifier to each request
 */
app.use(requestIdGeneratorMiddleware.httpContext);
app.use(requestIdGeneratorMiddleware.assignIdToIncomingRequest);

/*
 * Saves the request route to the logger
 */
app.use(logEntryRoute);

/**
 * Handling authenticated requests with jwt
 */
app.use(tokenValidator);
app.use(handledValidationError);

/*
 * Reads the status sent as string in the json response and changes the http status
 * to 500 if the current code is 200
 */
app.use(mung.json(genericErrorHandling.handledErrorReturnCode500));

app.get('/health-check',  asyncHandler(async (req, res, next) => {
    res.send("Process running");
}));

/**
 * New sync token signing to be used by client applications
 *
 * @Endpoint
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 */
app.post('/api/sync/sign',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.newToken(req.body.payload, "sync", req.body.expirationTime) );
}));

/**
 * Decodes a sync token used by a client application
 *
 * @Endpoint
 * @param {string} token The jwt to be validated
 */
app.post('/api/sync/decode',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.verifyToken(req.body.token) );
}));

/**
 * New async token signing to be used by client applications
 *
 * @Endpoint
 * @param {object} [payload] Contains any data that will be added to the token's payload
 * @param {int} [expirationTime] Defines the expiration time of the token, if not sent the token won't have an expiration
 */
app.post('/api/async/sign',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.newToken(req.body.payload, "async", req.body.expirationTime) );
}));

/**
 * Decodes an async token used by a client application
 *
 * @Endpoint
 * @param {string} token The jwt to be validated
 */
app.post('/api/async/decode',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.verifyToken(req.body.token) );
}));

/**
 * Add a token to the blacklist so that in further requests it won't be accepted as a
 * valid token even if its attributes and signature are correct
 *
 * @Endpoint
 * @param {string} token The jwt to be blocked
 * @returns {Promise<{status: string, message: string}>}
 */
app.post('/api/revoke',  asyncHandler(async (req, res, next) => {
    res.send( await clientApplication.revokeToken(req.body.token) );
}));

app.post('/api/auth/login',  asyncHandler(async (req, res, next) => {
    res.send( await userApplication.login(req.body.username, req.body.password) );
}));

app.post('/api/auth/logout',  asyncHandler(async (req, res, next) => {
    // TODO taken the token from headers
    res.send( await userApplication.logout(req.body.token));
}));

/*
 * Catches the errors if a user tries to access a protected route
 *
 * Note: this middleware must be loaded after defining the protected routes
 */
app.use(handledNoPermissionsError);

/*
 * Catches any exception that wasn't properly handled by the other processes and returns the user
 * a generic response while logging the error
 */
app.use(genericErrorHandling.handleUnCaughtError);

app.listen(process.env.APP_PORT, function () {
    (async() => {
        await bootstrapApplication.initializeUsers();
    })().catch(err => {
        loggerService.logger.error(`failed to initialize the database due to ${err}`)
        process.exit(1);
    });

    console.log(`App listening on port ${process.env.APP_PORT}!`);
});

