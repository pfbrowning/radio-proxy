# radio-proxy
node.js proxy server for streaming shoutcast / icecast style audio and passing now-playing info to clients via socket.io

This is still an early POC.  I'll write a proper readme once the project is closer to completion.

TODO
* Proxy Key authentication - generate a short-lived (10 seconds?) key from the proxyKey endpoint, and
require it as a query param on the stream endpoint.
* Logging
* Finish TODO comments throughout the code
* Refactor as necessary
* Investigate audio stream buffering
* Middlewares
* URL Validation on stream endpoint
* Consistent API responses
* Configure linting via `standard`
* Swagger
* Code coverage badge
* Write unit tests