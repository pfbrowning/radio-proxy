const { Subject, BehaviorSubject, merge } = require('rxjs');
const { startWith, distinctUntilChanged, filter, tap, map, share } = require('rxjs/operators');
const { uniq, isEqual } = require('lodash');

const metadataReceived = new Subject();

// Root Sync State
const lastKnownMetadata = new Map();

// Root Async State
const currentlyStreamingSource = new BehaviorSubject(new Map());
const clientUrlsSource = new BehaviorSubject(new Map());

// Derived Async State
exports.currentStreamingUrls$ = currentlyStreamingSource.pipe(
    map(map => [...map.keys()]),
    share()
)
exports.currentClientUrls$ = clientUrlsSource.pipe(
    map(clientUrlsMap => getCurrentClientStreams(clientUrlsMap)),
    share()
)

// State Write Operations ------------
exports.notifyStreamConnected = (url, streamId) => {
    const newStreamArray = (currentlyStreamingSource.value.get(url) || []).concat(streamId);
    /* Next up the source with a clone of the map with the new value
    https://stackoverflow.com/questions/57883677/how-to-immutably-update-a-map-in-javascript */
    currentlyStreamingSource.next(new Map(currentlyStreamingSource.value).set(url, newStreamArray));
};

exports.notifyStreamDisconnected = (url, streamId) => {
    // Create a new map which reflects that this particular stream is no longer listening to this url
    const newStreamArray = (currentlyStreamingSource.value.get(url) || []).filter(u => u !== streamId);
    const newMap = new Map(currentlyStreamingSource.value);
    if (newStreamArray.length > 0) {
        newMap.set(url, newStreamArray);
    } else {
        newMap.delete(url);
    }

    currentlyStreamingSource.next(newMap);

    /* TODO If there are no clients listening to this URL, then 
    delete it from lastKnownMetadata. */
}

exports.notifyMetadataReceived = (url, title) => {
    lastKnownMetadata.set(url, title);
    metadataReceived.next({ url, title });
}

exports.notifyClientConnected = (clientId) => {
    const newMap = new Map(clientUrlsSource.value).set(clientId, []);
    clientUrlsSource.next(newMap);
}

exports.notifyClientDisconnected = (clientId) => {
    const newMap = new Map(clientUrlsSource.value);
    newMap.delete(clientId);
    clientUrlsSource.next(newMap);
}

exports.notifyClientUrlsSet = (clientId, setUrls) => {
    const newMap = new Map(clientUrlsSource.value).set(clientId, uniq(setUrls));
    clientUrlsSource.next(newMap);
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
const getCurrentClientStreams = (clientUrlsMap) => {
    const flattened = [...clientUrlsMap.values()].reduce((prev, current) => prev.concat(current), []);
    return uniq(flattened);
}