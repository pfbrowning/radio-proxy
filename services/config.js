const nodeEnv = process.env.NODE_ENV;

exports.isProduction = nodeEnv && nodeEnv === 'production' || false;

exports.auth = {
    audience: process.env.audience,
    issuer: process.env.issuer
};