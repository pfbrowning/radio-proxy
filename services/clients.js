const state = require('./state');
const logger = require('./logging');

exports.initializeClient = (client) => {
    let metadataSubscription;

    state.notifyClientConnected(client.id);

    client.on('disconnect', () => {
        state.notifyClientDisconnected(client.id);
        metadataSubscription && metadataSubscription.unsubscribe();
        logger.debug('Client Disconnected', {clientId: client.id});
    });

    client.on('setStreams', urls => {
        state.notifyClientUrlsSet(client.id, urls);
        metadataSubscription && metadataSubscription.unsubscribe();
        metadataSubscription = state.observeMetadataForManyUrls(urls)
            .subscribe(({url, title}) => {
                client.emit('metadata', url, title);
                logger.debug('Metadata Sent To Client', {url, title});
            });
    });

    client.emit('socketInitialized');
    logger.debug('Socket Initialized', {clientId: client.id});
}