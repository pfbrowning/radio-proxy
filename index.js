const express = require('express')
const routes = require('./routes/routes')
const socketioJwt = require('socketio-jwt');
const clients = require('./services/clients');
const poller = require('./services/polling');
const auth = require('./services/authentication');
const cors = require('./middlewares/cors');
const logger = require('./services/logging');

// Configuration via environment variables
const port = process.env.PORT || 3000

const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(port);

// Require authentication on each socket before initializing if configured to do so.
if (auth.authConfigured()) {
    io.on('connection', socketioJwt.authorize({ secret: auth.jwksCallback, timeout: 15000 }))
    io.on('authenticated', (socket) => clients.initializeClient(socket))
} else {
    io.on('connection', socket => clients.initializeClient(socket));
}

app.use(cors);

// Connect imported routes to Express
app.use('/', routes)

logger.info('Server Initialized');