const cors = require('cors')
const configService = require('../services/config');

if (configService.allowedCorsOrigins) {
  module.exports = cors({ origin: allowedCorsOrigins })
} else {
  module.exports = cors()
}
