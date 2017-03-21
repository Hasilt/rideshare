
var authApiHandlers = require('../route-handlers/auth-api-handlers');
var riderApiHandlers = require('../route-handlers/rider-api-handlers');

function initialize(expressInstance, io, socket) {
    
    var app = expressInstance,
        debug = require('debug')('rideshare:auth-api');

    socket.on('driver-online', function(postData) {
        debug('a pat');
        debug(postData);
    });

    app.post('/rider/phone/verify', function(req, res) {
        debug('Inside /rider/phone/verify');
        authApiHandlers.checkForRides(req, function(responseData) {
            res.json(responseData);
        });
    });

    app.post('/driver/id/verify', function(req, res) {
        debug('Inside /driver/id/verify');
        authApiHandlers.checkForPolice(req, function(responseData) {
            res.json(responseData);
        });
    });

    app.post('/rider/signup', function(req, res) {
        debug('inside /rider/signup');
        authApiHandlers.registerNewRider(req, function(responseData) {
            req.session.regenerate(function() {
                req.session.user = responseData;

                res.json(responseData);
            });
        });
    });

    app.post('/driver/signup', function(req, res) {
        debug('inside /driver/signup');
        authApiHandlers.registerNewDriver(req, function(responseData) {
            req.session.regenerate(function() {
                req.session.user = responseData;

                res.json(responseData);
            });
        });
    });

    app.post('/rider/login', function(req, res) {
        debug('Inside /rider/login');
        authApiHandlers.loginRider(req, function(responseData) {
            if (responseData.status === 'loggedIn') {
                debug(responseData);

                req.session.regenerate(function() {
                    req.session.user = responseData;

                    res.json(responseData);
                });
            } else {
                res.json({
                    status: 'invalid'
                })
            }
        });
    });

    app.post('/driver/login', function(req, res) {
        debug('Inside /driver/login');
        authApiHandlers.loginDriver(req, function(responseData) {
            if (responseData.status === 'loggedIn') {
                debug(responseData);

                req.session.regenerate(function() {
                    req.session.user = responseData;

                    res.json(responseData);
                });
            } else {
                debug('inside else')
                res.json({
                    status: 'invalid'
                });
            }
        });
    });

    app.get('/logout', function(req, res) {
        debug('request to /logout');
        req.session.destroy(function() {
            res.redirect('/');
        });
    });

    // app.get('/', function (req, res) {
    //     debug('request to /');
    //     authApiHandlers.homeRender(req, function(argOne, argTwo){
    //         res.render(argOne, argTwo);
    //     });
    // });
}

exports.initialize = initialize