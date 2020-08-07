const messenger = require('./messenger');
const { filter } = require('rxjs/operators');
const { uniq } = require('lodash');

let connectedClients = {};

/**
 * 
 * @param {SocketIO.Socket} client 
 */
exports.initializeClient = (client) => {
    let streamUrls = [];
    const metadataSubscription = messenger.metadataReceived.pipe(
        filter(m => streamUrls.includes(m.url))
    ).subscribe(m => {
        client.emit('metadata', m.url, m.title);
    })
    connectedClients = {
        ...connectedClients,
        [client.id]: {
            client,
            streamUrls,
            metadataSubscription
        }
    };
    console.log('connected', client.id);
    client.on('disconnect', () => {
        const clientUrls = streamUrls;
        metadataSubscription.unsubscribe();
        delete connectedClients[client.id];
        const noLongerConnected = negativeJoinCurrentClientStreams(clientUrls);
        messenger.clientDisconnectedFromStreams.next(noLongerConnected);
    });

    client.on('setStreams', streams => {
        const uniqueNew = uniq(streams);
        const notYetConnected = negativeJoinCurrentClientStreams(uniqueNew);
        streamUrls = uniqueNew;
        console.log('stream subscribed', uniqueNew, notYetConnected);
        messenger.clientConnectedToStreams.next(notYetConnected);
    });
}

const negativeJoinCurrentClientStreams = (urls) => {
    const current = getCurrentClientStreams();
    return urls.filter(url => !current.includes(url));
}

const getCurrentClientStreams = () => {
    const flattened = Object.values(connectedClients)
        .reduce((prev, current) => prev.push(current.streamUrls), []);
    return uniq(flattened);
}