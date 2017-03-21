
var async = require('async');
var underscore = require('underscore');

var riderDbApi = require('../../database/rider-db-api');
var googleMapsApi = require('../utilities/google-maps-api');

var debug = require('debug')('rideshare:rider-api-handlers');

							function getNearestDrivers(req, responseCallback) {
				    var reqBody = req.body;
				    if (typeof(reqBody.coordinates) === 'string') {
				        reqBody.coordinates = JSON.parse(reqBody.coordinates)
				    }

				    var coordinates = [Number(reqBody.coordinates[1]), Number(reqBody.coordinates[0])];

    




    riderDbApi.getNearestDrivers(coordinates, function(err, results) {
        if (err) {
            debug(err);
        } else {
            var resultData = results.map(function(driverDetails) {
                return {
                    address: driverDetails.location.address,
                    coordinates: [driverDetails.location.coordinates[1], driverDetails.location.coordinates[0]]
                };
            });

            var responseData = {
                locationDetails: resultData
            }
            responseCallback(responseData);
        }
    });}





function requestRide(req, responseCallback) {
    debug('api-handler requestride');
    var reqBody = req.body;
    if (typeof(reqBody.coordinates) === 'string') {
        reqBody.coordinates = JSON.parse(reqBody.coordinates)
    }
    var coordinates = [Number(reqBody.coordinates[1]), Number(reqBody.coordinates[0])];

    async.auto({
        one: function(callback) {
            googleMapsApi.getlatLngDetails(reqBody.coordinates, callback);
        },

        two: ['one', function(callback) {
            riderDbApi.getNearestDrivers(coordinates, callback);
        }],
        three: ['two', function(callback, results) {
            var RiderDetails = {
                    userId: reqBody.userId,
                    displayName: reqBody.displayName,
                    location: {
                        coordinates: coordinates,
                        address: results.one.results[0].formatted_address,
                        type: "Point"
                    }
                },
                date = new Date();
            var RiderObj = {
                RiderDetails: RiderDetails,
                occurrenceTime: date.getTime(),
            }
            riderDbApi.registerNewIssue(RiderObj, callback);
        }],

        four: ['three', function(callback, results) {
            var resultArray = results.two.map(function(driverDetails) {
                return {
                    userId: driverDetails.userId,
                    displayName: driverDetails.displayName,
                    phone: driverDetails.phone,
                    location: {
                        address: driverDetails.location.address,
                        coordinates: [driverDetails.location.coordinates[1], driverDetails.location.coordinates[0]]
                    },
                    rating: driverDetails.earnedRatings / driverDetails.totalRatings * 100
                };
            });
            //debug(resultData);
            var driverArray = underscore.filter(resultArray, function(driverDetails) {
                return driverDetails.rating >= 50
            });

            if (driverArray.length === 0) {
                driverArray = resultArray;
            };
            var riderData = {
                issueId: results.three.issueId,
                RiderDetails: {
                    userId: reqBody.userId,
                    phone: reqBody.userId,
                    displayName: reqBody.displayName,
                    location: {
                        coordinates: coordinates,
                        address: results.one.results[0].formatted_address
                    }
                }
            }
            var driverData = {
                driverData: driverArray
            };



            responseCallback(riderData, driverData);

            callback(null, riderData);
        }]
    }, function(err, results) {
        if (err) {
            debug(err);
        } else {
            
        }
    });
}

function endIssue(req, responseCallback) {
    debug('api-handler endIssue');
    var date = new Date();
    var data = {
        issueId: req.body.issueId,
        endTime: date.getTime()
    }
    riderDbApi.endIssue(data, function(err, result) {
        if (err) {
            debug(err);
        } else {
            var responseData = {
                status: 'resolved'
            }
            responseCallback(responseData);
        }
    })
}

function rateDriver(req, responseCallback) {
    debug('inside ratedr');

};

function updateRiderLocation(req, responseCallback) {
    debug('inside updateRiderLocation');
    var reqBody = req.body;
    if (typeof(reqBody.coordinates) === 'string') {
        reqBody.coordinates = JSON.parse(reqBody.coordinates)
    }
    async.auto({
            one: function(callback) {
                googleMapsApi.getlatLngDetails(reqBody.coordinates, callback);
            },
            two: ['one', function(callback, results) {
                debug(results);
                var locationData = {
                    phone: req.session.user.userId,
                    address: results.one.results[0].formatted_address,
                    coordinates: [Number(reqBody.coordinates[1]), Number(reqBody.coordinates[0])]
                }
                RiderDbApi.updateRiderLocation(locationData, callback)
            }]
        },
        function(err, results) {
            if (err) {
                debug(err);
            } else {
                var resultData = {
                    status: 'Location updated'
                }
                responseCallback(resultData);
            }
        }
    );};





function getIssues(req, responseCallback) {
    debug('inside getIssues');
    riderDbApi.getIssues(function(err, resultData) {
        if (err) {
            debug(err);
        } else {
            var geoJsonData = resultData.issues.map(function(issueDetails) {
                return {
                    type: 'Feature',
                    geometry: {
                        type: "Point",
                        coordinates: issueDetails.RiderDetails.location.coordinates
                    },
                    properties: {
                        address: issueDetails.RiderDetails.location.address,
                        occurrenceTime: issueDetails.occurrenceTime,
                        responseTime: issueDetails.responseTime,
                        status: issueDetails.status
                    }
                }
            });
            var responseData = {
                type: 'FeatureCollection',
                features: geoJsonData
            }
            responseCallback(responseData);
        }
    });
};

exports.getNearestDrivers = getNearestDrivers;
exports.requestRide = requestRide;
exports.endIssue = endIssue;
//exports.rateCop = rateCop;
exports.updateRiderLocation = updateRiderLocation;
exports.getIssues = getIssues;