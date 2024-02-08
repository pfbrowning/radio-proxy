const nodeEnv = process.env.NODE_ENV;

exports.isProduction = nodeEnv && nodeEnv === 'production' || false;
exports.allowedCorsOrigins = (process.env.allowedCorsOrigins && corsOriginsFromEnvironment.split(',')) ?? null;
