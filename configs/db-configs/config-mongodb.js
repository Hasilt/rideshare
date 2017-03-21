var mongodb = require('mongodb');

var MongoClient, mongoDB, that = this;

function configure(callback) {
    that.MongoClient = mongodb.MongoClient,
        Server = mongodb.Server;
    var server = 'mongodb://localhost:27017/rideshare';

    that.MongoClient.connect(server, function(err, db) {
        if (err) {
            var error = {
                message: 'MongoDB connect failed',
                error: err
            }
            callback(error);
        } else {
            that.mongoDB = db;
            callback(null, 'Connection with mongodb established');
        }

    });
}

function mongoClientDB() {
    return that.mongoDB;
}

exports.configure = configure;
exports.mongoClientDB = mongoClientDB;