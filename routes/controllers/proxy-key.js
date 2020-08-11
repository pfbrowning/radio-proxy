const proxyKey = require('../../services/proxy-key');

exports.apiPOST = (req, res) => {
    res.status(201).set('Content-Type', 'text/plain').send(proxyKey.generate());
}
