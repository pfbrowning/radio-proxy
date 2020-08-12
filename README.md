# radio-proxy
node.js proxy server for streaming shoutcast / icecast style audio and passing now-playing info to clients via socket.io

This is still an early POC.  I'll write a proper readme once the project is closer to completion.

TODO
* Gitignored local config
* Configure linting via `standard`
* Configure Jasmine
* Finish TODO comments throughout the code
* Refactor as necessary
* Stream validation / PLS reader
* Include extra context from the stream's response headers along with the stream title
* Investigate audio stream buffering?
* Should we be using rooms?
* Should we be using redis?
* Middlewares
* URL Validation on stream endpoint
* Consistent API responses
* Swagger
* Code coverage badge
* Write unit tests
* Write readme