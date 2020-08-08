const state = require('./state');

exports.initializeClient = (client) => {
    let metadataSubscription;

    state.notifyClientConnected(client.id);

    client.on('disconnect', () => {
        state.notifyClientDisconnected(client.id);
        metadataSubscription && metadataSubscription.unsubscribe();
    });

    client.on('setStreams', urls => {
        state.notifyClientUrlsSet(client.id, urls);
        metadataSubscription && metadataSubscription.unsubscribe();
        metadataSubscription = state.observeMetadataForManyUrls(urls)
            .subscribe(metadata => client.emit('metadata', metadata.url, metadata.title))
    });
}