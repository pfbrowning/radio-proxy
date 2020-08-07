const icy = require('icy');
const messenger = require('../../services/messenger');
const { v4: uuid } = require('uuid');
const streamState = require('../../services/stream-state');

exports.apiGET = function (req, expressResponse) {
    const requestId = uuid();
    icy.get(req.query.url, icyResponse => {
        streamState.streamConnected(req.query.url, requestId);

        icyResponse.on('metadata', (metadata) => {
            var parsed = icy.parse(metadata);
            streamState.metadataReceived(req.query.url, parsed.StreamTitle);
            messenger.metadataReceived.next({
                url: req.query.url,
                title: parsed.StreamTitle
            });
        });

        expressResponse.set('content-type', icyResponse.headers['content-type']);
        icyResponse.pipe(expressResponse);
    });
    
    req.on('close', () => {
        console.log('request closed', requestId);
        streamState.requestClosed(req.query.url, requestId)
    });
}
