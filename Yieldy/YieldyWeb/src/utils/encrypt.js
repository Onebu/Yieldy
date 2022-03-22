// Nodejs encryption with CTR
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

export function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, process.env.REACT_APP_KEY)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

export function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, process.env.REACT_APP_KEY)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}