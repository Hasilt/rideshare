
 
var redis = require('redis');
var redisClient, that = this;

function configure(callback) {
    redisClient = redis.createClient();
    callback(null, 'connection with redis established');
}

function redisClient() {
    redisClient;
}

exports.configure = configure;
exports.redisClient = redisClient;