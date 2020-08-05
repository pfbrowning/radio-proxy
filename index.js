const express = require('express')
const routes = require('./routes/routes')
const clients = require('./services/clients');

// Configuration via environment variables
const port = process.env.PORT || 3000

const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', client => clients.onClientConnected(client));

server.listen(3000);

// Connect imported routes to Express
app.use('/', routes)


