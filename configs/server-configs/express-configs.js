

var express = require('express');
var async = require('async');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var serveFavicon = require('serve-favicon');
var expressSession = require('express-session');
var redis = require('redis');

function configure() {

    var RedisStore = require('connect-redis')(expressSession),
        MongoStore = require('connect-mongo')(expressSession);

    var busboy = require('connect-busboy'),
        _ = require('underscore'),
        consolidate = require('consolidate'),
        debug = require('debug')('rideshare:express-configs');

    var expressInstance = express(),
        options = {
            db: 2,
            client: redis.createClient(),
            ttl: 60 * 60 * 24 * 365
        };

    expressInstance.disable('x-powered-by');

    expressInstance.set('views', 'views');
    expressInstance.set('view engine', 'html');
    expressInstance.engine('html', consolidate.underscore);


    expressInstance.use(express.static('./public'));
    expressInstance.use(bodyParser.urlencoded({
        extended: true,
    }));

    expressInstance.use(bodyParser.json({
        limit: '5mb'
    }));
    expressInstance.use(cookieParser());

    expressInstance.use(busboy());

    expressInstance.use(expressSession({
        secret: 'app',
        store: new RedisStore({
            db: 2
        }),
        saveUninitialized: true,
        resave: true
    }));

  

    return expressInstance
}

exports.configure = configure;