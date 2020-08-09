const currentTime = require('./current-time');
const { v4: uuid } = require('uuid');
const { timer } = require('rxjs');

const keys = new Map();

exports.generate = () => {
    const key = uuid();
    // Expires 10 seconds from now
    const expiresIn = 10000;
    const expiration = currentTime.unixMs() + expiresIn;

    keys.set(key, expiration);

    timer(expiresIn + 5000).subscribe(() => keys.delete(key));

    return key;
}

exports.validate = (key) => {
    const expiration = keys.get(key);
    return expiration && expiration >= currentTime.unixMs();
}