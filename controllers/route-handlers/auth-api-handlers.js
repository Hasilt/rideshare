
var async = require('async');
var bcrypt = require('bcrypt');
var crypto = require('crypto');

var authDbApi = require('../../database/auth-db-api');

var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10,
    debug = require('debug')('rideshare:auth-api-handlers');


function checkForRides(req, responseCallback) {
    authDbApi.getRiderDetails(req.body, function(err, resultData) {
        var responseData = {};
        if (err) {
            debug(err);
        } else {
            if (resultData.phone) {
                responseData = {
                    status: 'notavailable'
                }
            } else {
                responseData = {
                    status: 'available'
                }
            }
        }
        responseCallback(responseData);
    });
}

function checkForDrivers(req, responseCallback) {
    authDbApi.getDriverDetails(req.body, function(err, resultData) {
        var responseData = {};
        if (err) {
            debug(err);
        } else {
            if (resultData.userId) {
                responseData = {
                    status: 'notavailable'
                }
            } else {
                responseData = {
                    status: 'available'
                }
            }
        }
        responseCallback(responseData);
    });
}

function registerNewRider(req, responseCallback) {
    debug('api-handler registerNewRider');

    var reqObj = req.body;

    var token = crypto.randomBytes(15).toString('hex');
    reqObj.token = token;

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            debug(err);
        }

        // hash the password using our new salt
        bcrypt.hash(reqObj.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            reqObj.password = hash;
            authDbApi.registerNewRider(reqObj, function(err, resultData) {
                if (err) {
                    debug(err);
                } else {
                    resultData = {
                        userId: resultData.userId,
                        displayName: resultData.displayName,
                        status: 'loggedIn',
                        userType: 'Rider'
                    };

                    responseCallback(resultData);
                }
            });
        });
    });
}

function registerNewDriver(req, responseCallback) {
    debug('api-handler registerNew');

    var reqObj = req.body;

    var token = crypto.randomBytes(15).toString('hex');
    reqObj.token = token;

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            debug(err);
        }

        // hash the password using our new salt
        bcrypt.hash(reqObj.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            reqObj.password = hash;
            authDbApi.registerNewDriver(reqObj, function(err, resultData) {
                if (err) {
                    debug(err);
                } else {
                    resultData = {
                        userId: resultData.userId,
                        displayName: resultData.displayName,
                        status: 'loggedIn',
                        userType: 'Driver'
                    };
                    responseCallback(resultData);
                }
            });
        });
    });
}

function loginRider(req, responseCallback) {
    debug('api-handler loginCitizen');
    debug(req.body);
    var reqObj = req.body;

    async.series(
        [
            function(callback) {
                authDbApi.getRiderDetails(reqObj, callback);
            }
        ],
        function(err, results) {
            if (err) {
                debug(err);
            } else {
                var resultData = {};
                if (results[0].phone) {
                    bcrypt.compare(req.body.password, results[0].password, function(err, res) {
                        if (err) {
                            debug(err);
                        } else {
                            if (res) {
                                debug('success')
                                resultData = {
                                    userId: results[0].userId,
                                    displayName: results[0].displayName,
                                    status: 'loggedIn',
                                    userType: 'rider'
                                }
                            } else {
                                debug('failure');
                                resultData = {
                                    userId: null,
                                    displayName: null,
                                    status: null,
                                    userType: null
                                }
                            }

                            responseCallback(resultData);
                        }
                    });
                } else {
                    resultData = {
                        userId: null,
                        displayName: null,
                        status: null,
                        userType: null
                    }
                    responseCallback(resultData);
                }
            }
        }
    );
}

function loginDriver(req, responseCallback) {
    debug('api-handler loginPolice');

    var reqObj = req.body;

    async.series(
        [
            function(callback) {
                authDbApi.getDriverDetails(reqObj, callback);
            }
        ],
        function(err, results) {
            if (err) {
                debug(err);
            } else {
                var resultData = {};
                if (results[0].userId) {
                    bcrypt.compare(req.body.password, results[0].password, function(err, res) {
                        if (err) {
                            debug(err);
                        } else {
                            if (res) {
                                debug('success')
                                resultData = {
                                    userId: results[0].userId,
                                    displayName: results[0].displayName,
                                    status: 'loggedIn',
                                    userType: 'driver'
                                }
                            } else {
                                debug('failure');
                                resultData = {
                                    userId: null,
                                    displayName: null,
                                    status: null,
                                    userType: null
                                }
                            }

                            responseCallback(resultData);
                        }
                    });
                } else {
                    resultData = {
                        userId: null,
                        displayName: null,
                        status: null,
                        userType: null
                    }
                    responseCallback(resultData);
                }
            }
        }
    );
}

function homeRender(req, responseCallback) {
    debug('inside homeRender');
    var argOne = 'index',
        argTwo = {};
    console.log(req.session.user);
    if (req.session.user) {
        argTwo = {
            user_id: req.session.user.userId,
            status: req.session.user.status,
            display_name: req.session.user.displayName,
            user_type: req.session.user.userType
        };
    } else {
        argTwo = {
            user_id: null,
            status: null,
            display_name: null,
            user_type: null
        };
    }

    responseCallback(argOne, argTwo);
};

exports.checkForRides = checkForRides;
exports.checkForDrivers = checkForDrivers;
exports.registerNewRider = registerNewRider;
exports.registerNewDriver = registerNewDriver;
exports.loginRider = loginRider;
exports.loginDriver = loginDriver;
exports.homeRender = homeRender;