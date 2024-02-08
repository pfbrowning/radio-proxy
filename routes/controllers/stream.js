const icy = require('icy');
const { v4: uuid } = require('uuid');
const state = require('../../services/state');
const logger = require('../../services/logging');
const authenticationService = require('../../services/authentication');
const proxyKeyService = require('../../services/proxy-key');

exports.apiGET = function (req, res) {
    const requestId = uuid();
    if (authenticationService.authConfigured() && !proxyKeyService.validate(req.query.key)) {
        return res.status(401).json({error: "Valid Proxy Key Required"});
    }
    const icyClient = icy.get(req.query.url, icyResponse => {
        state.notifyStreamConnected(req.query.url, requestId);

        icyResponse.on('metadata', (metadata) => {
            var parsed = icy.parse(metadata);
            state.notifyMetadataReceived(req.query.url, parsed.StreamTitle);
        });

        icyResponse.pipe(res);
    });

    icyClient.on('error', (error) => {
        const statusCode = error.code === 'ECONNREFUSED' ? 503 : 500;
        logger.error('icy client error', error);
        return res.status(statusCode).json();
    });
    
    req.on('close', () => {
        state.notifyStreamDisconnected(req.query.url, requestId)
    });
}
