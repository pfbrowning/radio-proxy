const winston = require('winston')
const configService = require('./config');
require('winston-daily-rotate-file');

const transports = [
    // Write to stdout for local debugging via console and for Heroku logging
    new winston.transports.Console({
        handleExceptions: true,
        // Use 'info' for the deployed app on Heroku and 'debug' for local debugging
        level: configService.isProduction ? 'info' : 'debug'
    })
]

// Write a debug-level log to a daily rolling file while developing locally
if (!configService.isProduction) {
    transports.push(new winston.transports.DailyRotateFile({
        filename: 'log.%DATE%',
        dirname: 'logs',
        level: 'debug',
        handleExceptions: true
    }));
}

const format = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.simple()
);

const logger = winston.createLogger({ format, transports });

module.exports = logger
