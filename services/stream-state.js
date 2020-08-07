const { ReplaySubject } = require('rxjs');

const currentStreams = {};

exports.streamConnected = (url, streamId) => {
    const urlStreams = currentStreams[url];
    if (!urlStreams) {
        currentStreams[url] = {
            streams: [ streamId ]
        }
        // TODO Notify that a stream connection started via a subject on messenger
        console.log('started to stream', url, streamId, currentStreams);
    } else {
        urlStreams.streams = urlStreams.streams.concat(streamId);
    }
};

exports.metadataReceived = (url, metadata) => {
    currentStreams[url].latestMetadata = metadata;
    console.log('metadata set', currentStreams);
}

exports.requestClosed = (url, streamId) => {
    currentStreams[url].streams = currentStreams[url].streams.filter(s => s !== streamId);
    if (currentStreams[url].streams.length === 0) {
        delete currentStreams[url];
        // TODO Notify that we're no longer streaming this URL
        console.log('closed stream', url, streamId, currentStreams);
    }
}