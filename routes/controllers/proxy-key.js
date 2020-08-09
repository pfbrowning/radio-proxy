const proxyKey = require('../../services/proxy-key');

exports.apiPOST = (req, res) => {
    res.status(201).json({proxyKey: proxyKey.generate()});
}
