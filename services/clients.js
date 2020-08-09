const state = require('./state');
const logger = require('./logging');

exports.initializeClient = (client) => {
    let metadataSubscription;

    state.notifyClientConnected(client.id);

    client.on('disconnect', () => {
        state.notifyClientDisconnected(client.id);
        metadataSubscription && metadataSubscription.unsubscribe();
    });

    client.on('setStreams', (urls, ack) => {
        state.notifyClientUrlsSet(client.id, urls);
        metadataSubscription && metadataSubscription.unsubscribe();
        metadataSubscription = state.observeMetadataForManyUrls(urls)
            .subscribe(({url, title}) => {
                client.emit('metadata', url, title);
                logger.debug('Metadata Sent To Client', {url, title});
            });
        ack();
    });

    client.emit('clientInitialized');
}