const icy = require('icy');
const { v4: uuid } = require('uuid');
const state = require('../../services/state');

exports.apiGET = function (req, expressResponse) {
    const requestId = uuid();
    icy.get(req.query.url, icyResponse => {
        state.notifyStreamConnected(req.query.url, requestId);

        icyResponse.on('metadata', (metadata) => {
            var parsed = icy.parse(metadata);
            state.notifyMetadataReceived(req.query.url, parsed.StreamTitle);
        });

        expressResponse.set('content-type', icyResponse.headers['content-type']);
        icyResponse.pipe(expressResponse);
    });
    
    req.on('close', () => {
        state.notifyStreamDisconnected(req.query.url, requestId)
    });
}
