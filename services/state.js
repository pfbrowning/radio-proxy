const { Subject, merge } = require('rxjs');
const { startWith, distinctUntilChanged, filter } = require('rxjs/operators');
const { uniq, isEqual } = require('lodash');

const clientConnectedToStreams = new Subject();
const clientDisconnectedFromStreams = new Subject();
const metadataReceived = new Subject();

const currentlyPolling = [];
const currentlyStreaming = new Map();
const lastKnownMetadata = new Map();
const clientUrls = new Map();

// State Write Operations ------------
exports.notifyStreamConnected = (url, streamId) => {
    if (!currentlyStreaming.has(url)) {
        currentlyStreaming.set(url, [ streamId ]);
        // TODO Notify that we started to stream on this url
        console.log('started to stream', url, streamId);
    } else {
        const current = currentlyStreaming.get(url);
        currentlyStreaming.set(url, current.concat(streamId));
    }
};

exports.notifyStreamDisconnected = (url, streamId) => {
    // Update the map to reflect that this particular stream is no longer listening to this url
    const current = currentlyStreaming.get(url).filter(u => u !== streamId);
    currentlyStreaming.set(url, current);

    // If no stream is listening on the URL, then delete the key
    if (currentlyStreaming.get(url).length === 0) {
        currentlyStreaming.delete(url);
        // TODO Notify that we're no longer streaming this URL
        console.log('closed stream', url, streamId);
    }
    /* TODO If there are no clients listening to this URL, then 
    delete it from lastKnownMetadata. */
}

exports.notifyMetadataReceived = (url, title) => {
    lastKnownMetadata.set(url, title);
    metadataReceived.next({ url, title });
    console.log('metadata set', lastKnownMetadata);
}

exports.notifyClientConnected = (clientId) => {
    clientUrls.set(clientId, []);
}

exports.notifyClientDisconnected = (clientId) => {
    const urlsForDisconnectingClient = clientUrls.get(clientId);
    clientUrls.delete(clientId);
    const disconnectedUrls = negativeJoinCurrentClientStreams(urlsForDisconnectingClient);
    /* TODO Notify that nobody is listening on disconnectedUrls anymore so that any polling
    operations for those URLs can be cancelled. */
}

exports.notifyClientUrlsSet = (clientId, setUrls) => {
    const uniqueSetUrls = uniq(setUrls);
    const newUrls = negativeJoinCurrentClientStreams(uniqueSetUrls);
    const urlsBeforeSet = getCurrentClientStreams();
    clientUrls.set(clientId, uniqueSetUrls);
    const disconnectedUrls = negativeJoinCurrentClientStreams(urlsBeforeSet);
    /* TODO Notify listeners that new URLs were set and that old URLs were disconnected
    so that polling operations can be started and stopped respectively. */
}

// Observable Factories ------
const observeMetadataForSingleUrl = (url) => {
    let obs = metadataReceived.pipe(filter(m => m.url === url));
    if (lastKnownMetadata.has(url)) {
        const title = lastKnownMetadata.get(url);
        obs = obs.pipe(startWith({url, title}));
    }
    obs = obs.pipe(distinctUntilChanged((x, y) => isEqual(x, y)));
    return obs;
};

exports.observeMetadataForManyUrls = (urls) => {
    const metadataObservables = urls.map(url => observeMetadataForSingleUrl(url));
    return merge(...metadataObservables);
};

// State Queries --------
const negativeJoinCurrentClientStreams = (urls) => {
    const current = getCurrentClientStreams();
    return urls.filter(url => !current.includes(url));
}

const getCurrentClientStreams = () => {
    const flattened = [...clientUrls.values()].reduce((prev, current) => prev.concat(current), []);
    return uniq(flattened);
}