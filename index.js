"use strict";

require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const cors = require('cors');

const genericErrorHandling = require('./src/middleware/genericErrorHandler');

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

app.get('/',  asyncHandler(async (req, res, next) => {
    res.send('Hello World!');
}));

/*
 * Catches any exception that wasn't properly handled by the other processes and returns the user
 * a generic respond while logging the error
 */
app.use(genericErrorHandling.handleUnCaughtError);

app.listen(process.env.APP_PORT, function () {
    console.log(`App listening on port ${process.env.APP_PORT}!`);
});

