require("dotenv").config();
const http = require('http');

const options = {
    host: '0.0.0.0',
    port: process.env.APP_PORT,
    path: '/',
    method: 'GET',
    timeout: 2000
};

const healthCheck = http.request(options, (res) => {
    if (res.statusCode === 200) {
        process.exit(0);
    }
    else {
        process.exit(1);
    }
});

healthCheck.on('error', function (err) {
    console.error("Couldn't connect to the service");
    process.exit(1);
});

healthCheck.end();