const cors = require('cors')

const fromEnv = process.env.allowedCorsOrigins;

let allowedCorsOrigins = fromEnv && fromEnv.split(',') || [];
if (allowedCorsOrigins.length > 0) {
  module.exports = cors({ origin: allowedCorsOrigins })
} else {
  module.exports = cors()
}
