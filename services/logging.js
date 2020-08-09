const winston = require('winston')
const configService = require('./config');
require('winston-daily-rotate-file');

const transports = [
  new winston.transports.Console({
      handleExceptions: true,
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
    winston.format.timestamp(),
    winston.format.simple()
);

const logger = winston.createLogger({ format, transports });

module.exports = logger
