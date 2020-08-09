const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')

const audience = process.env.audience;
const issuer = process.env.issuer;

exports.authConfigured = () => issuer && audience;

exports.jwksCallback = this.authConfigured()
    ? jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuer}.well-known/jwks.json`
    })
    : undefined;

exports.jwtMiddleware = this.authConfigured()
    ? jwt({
        secret: module.exports.jwksCallback,
        audience: audience,
        issuer: issuer,
        algorithms: ['RS256']
    })
    : (req, res, next) => next()