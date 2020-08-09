const morgan = require('morgan');
const logger = require('../services/logging');
const config = require('../services/config');

const stream = { write: message => logger.info(message) };

/* Log requests while debugging locally, but not while deployed to Heroku because Heroku already
logs HTTP requests for us. */
module.exports = !config.isProduction ? morgan("tiny", { stream }) : (req, res, next) => next();