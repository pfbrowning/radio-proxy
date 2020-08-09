const routes = require('express').Router()
const stream = require('./controllers/stream');
const proxyKey = require('./controllers/proxy-key');
const auth = require('../services/authentication');

routes.get('/stream', stream.apiGET);
routes.post('/proxyKey', auth.jwtMiddleware, proxyKey.apiPOST);

module.exports = routes
