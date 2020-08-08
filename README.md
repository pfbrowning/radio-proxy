# radio-proxy
node.js proxy server for streaming shoutcast / icecast style audio and passing now-playing info to clients via socket.io

This is still an early POC.  I'll write a proper readme once the project is closer to completion.

TODO
* Configure GH Actions pipeline
* Authenticate SocketIO connection ([like this](https://github.com/auth0-community/auth0-socketio-jwt)?)
* Authenticate stream proxy endpoint - perhaps with a short-lived key required in the URL?
* Logging
* Finish TODO comments throughout the code
* Refactor as necessary
* Configure linting via `standard`
* Write unit tests
* Code coverage badge