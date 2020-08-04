const routes = require('express').Router()
const stream = require('./controllers/stream')

routes.get('/stream', stream.apiGET)

module.exports = routes
