const messenger = require('./messenger');
const { filter, tap } = require('rxjs/operators');
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
        console.log('stream subscribed', streamUrls, streams, uniqueNew, notYetConnected);
        messenger.clientConnectedToStreams.next(notYetConnected);
    });
}

const negativeJoinCurrentClientStreams = (urls) => {
    const current = getCurrentClientStreams();
    return urls.filter(url => !current.includes(url));
}

const getCurrentClientStreams = () => {
    // console.log('get current streams', connectedClients);
    const flattened = Object.values(connectedClients)
        .reduce((prev, current) => {
            console.log('pushing', prev, current.streamUrls);
            
            return prev.concat(current.streamUrls);
        }, []);
    return uniq(flattened);
}