const icy = require('icy');
const { v4: uuid } = require('uuid');
const state = require('../../services/state');
const authenticationService = require('../../services/authentication');
const proxyKeyService = require('../../services/proxy-key');

exports.apiGET = function (req, res) {
    const requestId = uuid();
    if (authenticationService.authConfigured() && !proxyKeyService.validate(req.query.key)) {
        return res.status(401).json({error: "Valid Proxy Key Required"});
    }
    icy.get(req.query.url, icyResponse => {
        state.notifyStreamConnected(req.query.url, requestId);

        icyResponse.on('metadata', (metadata) => {
            var parsed = icy.parse(metadata);
            state.notifyMetadataReceived(req.query.url, parsed.StreamTitle);
        });

        res.set('content-type', icyResponse.headers['content-type']);
        icyResponse.pipe(res);
    });
    
    req.on('close', () => {
        state.notifyStreamDisconnected(req.query.url, requestId)
    });
}
