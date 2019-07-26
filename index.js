"use strict";

require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

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

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(process.env.APP_PORT, function () {
    console.log(`App listening on port ${process.env.APP_PORT}!`);
});

