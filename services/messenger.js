const { Subject } = require('rxjs');

exports.clientConnectedToStreams = new Subject();
exports.clientDisconnectedFromStreams = new Subject();
exports.metadataReceived = new Subject();