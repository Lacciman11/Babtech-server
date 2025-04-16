const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Morgan logging to the access.log file
const morganMiddleware = morgan('combined', { stream: accessLogStream });

module.exports = morganMiddleware;
