let clients = {};

/**
 * 
 * @param {SocketIO.Socket} client 
 */
exports.onClientConnected = (client) => {
    clients = {
        ...client,
        [client.id]: client
    };
    console.log('connected', client.id);
    client.on('disconnect', () => onClientDisconnected(client));

    client.on('streamConnect', data => console.log('event', data));
}


/**
 * 
 * @param {SocketIO.Socket} client 
 */
const onClientDisconnected = (client) => {
    delete clients[client.id];
}

const onStreamSubscribed = (client, data) => {
    console.log('stream subscribed', client.id, data);
}