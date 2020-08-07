const icecastParser = require('icecast-parser');
const messenger = require('../../services/messenger');

exports.apiGET = function (req, res) {
    console.log('request received for', req.query.url);
    let myStream;
    // Use http://localhost:3000/stream?url=http%3A%2F%2F188.165.212.92%3A8000%2Fheavy128mp3 in your browser
    const radioStation = new icecastParser({
        url: req.query.url,
        keepListen: true
    });

    radioStation.on('end', function(error) {
        console.log(['Connection to', this.getConfig('url'), 'was finished'].join(' '));
    });
    
    radioStation.on('error', function(error) {
        console.log(['Connection to', this.getConfig('url'), 'was rejected'].join(' '));
    });
    
    radioStation.on('empty', function() {
        console.log(['Radio station', this.getConfig('url'), 'doesn\'t have metadata'].join(' '));
    });

    radioStation.on('metadata', function(metadata) {
        console.log(metadata);
        messenger.metadataReceived.next({
            url: req.query.url,
            title: metadata.StreamTitle
        });
    });

    radioStation.on('stream', function(stream) {
        console.log('streaming');
        stream.pipe(res);
        // Store a reference to the stream so that we can kill it later
        myStream = stream;
    });

    // setTimeout(() => {
    //     console.log('killing');
    //     myStream.destroy();        
    // }, 10000);

    // Destroy the stream when the client closes the browser so we don't continue using bandwidth
    req.on('close', function () {
        myStream && myStream.destroy();
        console.log('Client closed the connection');
    });
}
