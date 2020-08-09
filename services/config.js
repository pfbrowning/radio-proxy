const nodeEnv = process.env.NODE_ENV;

exports.isProduction = nodeEnv && nodeEnv === 'production' || false;