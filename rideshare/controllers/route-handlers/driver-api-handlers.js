
var async = require('async');

var driverDbApi = require('../../database/driver-db-api');
var authDbApi = require('../../database/auth-db-api');
var googleMapsApi = require('../utilities/google-maps-api');
var debug = require('debug')('ride:handlers');

function acknowledgeRequest(req, responseCallback) {
    debug('api-handler acknowledgeRequest');
    var reqBody = req.body;
    if (typeof(reqBody.RiderDetails) === 'string') {
        reqBody.RiderDetails = JSON.parse(reqBody.RiderDetails)
    }
    if (typeof(reqBody.driverDetails) === 'string') {
        reqBody.driverDetails = JSON.parse(reqBody.driverDetails)
    }
    var riderCoordinates = [Number(reqBody.RiderDetails.location.coordinates[1]), Number(reqBody.RiderDetails.location.coordinates[0])];

    async.auto({
        one: function(callback) {
            driverDbApi.checkIssueStatus(reqBody.issueId, callback);
        },

        two: ['one', function(callback, results) {
            if (results.one.status === 'active') {
                googleMapsApi.getlatLngDetails(reqBody.RiderDetails.location.coordinates, callback);
            } else {
                var result = {
                    status: 'A police is already on it'
                }
                callback(result);
            }

        }],
        three: ['two', function(callback, results) {
            authDbApi.getDriverDetails(reqBody.driverDetails, callback);
        }]
    }, function(err, results) {
        if (err) {
            debug(err);
            if (err.status) {
                responseCallback(err);
            }
        } else {
            var RiderDetails = {
                userId: reqBody.RiderDetails.userId,
                displayName: reqBody.RiderDetails.displayName,
                phone: reqBody.RiderDetails.userId,
                location: {
                    address: results.two.results[0].formatted_address,
                    coordinates: riderCoordinates
                }
            }

            var driverDetails = {
                userId: reqBody.driverDetails.userId,
                displayName: reqBody.driverDetails.displayName,
                //phone: reqBody.driverDetails.phone,
                location: results.three.location
            }

            var riderdata = {
                    issueId: reqBody.issueId,
                    RiderDetails: RiderDetails
                },
                date = new Date(),
                policeData = {
                    issueId: reqBody.issueId,
                    driverDetails: driverDetails,
                    responseTime: date.getTime(),
                    status: 'engaged'
                },
                

                statusData = {
                    issueId: reqBody.issueId,
                    responseTime: date.getTime(),
                };

            responseCallback(riderdata, policeData);
            driverDbApi.updateIssueStatus(statusData, driverDetails, function(err, result) {
                if (err) {
                    debug(err);
                } else {
                    debug(result);
                }
            });
        }
    });
}

function getRiderDetails(req, responseCallback) {
    debug('api-handler getRiderDetails');
}



function updateDriverLocation(req, responseCallback) {
    debug('inside updateDriverLocation');
    var reqBody = req.body;
    if (typeof(reqBody.coordinates) === 'string') {
        reqBody.coordinates = JSON.parse(reqBody.coordinates)
    }
    async.auto({
            one: function(callback) {
                googleMapsApi.getlatLngDetails(reqBody.coordinates, callback);
            },
            two: ['one', function(callback, results) {
                var locationData = {
                    userId: reqBody.userId,
                    address: results.one.results[0].formatted_address,
                    coordinates: [Number(reqBody.coordinates[1]), Number(reqBody.coordinates[0])]
                }
                driverDbApi.updateDriverLocation(locationData, callback)
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
    );
};

function getDriverLocation(req, responseCallback) {
    debug('inside getDriverLocation');

    driverDbApi.getDriverLocation(req.params.userId, responseCallback);
};

function getNearestIssues(req, responseCallback) {
    var reqBody = req.body;

    debug(req.query);
    if (typeof(reqBody.coordinates) === 'string') {
        reqBody.coordinates = JSON.parse(reqBody.coordinates)
    }

    var coordinates = [Number(req.query.lng), Number(req.query.lat)];
    
    async.auto({
            one: function(callback) {
                driverDbApi.getIssuesOfDriver(req.session.user.userId, callback);
            },
            two: ['one', function(callback, results) {
                
                driverDbApi.getNearestIssues(coordinates, callback)
            }]
        },
        function(err, results) {
            if (err) {
                debug(err);
            } else {
                debug(results);
                var engagedIssues = results.one.map(function(issueData){
                    return {
                        issueId: issueData["_id"],
                        RiderDetails: issueData.RiderDetails,
                        driverDetails: issueData.driverDetails,
                        status: issueData.status,
                        occurrenceTime: issueData.occurrenceTime
                    }
                    
                });

                var activeIssues = results.two.map(function(issueData){
                    return {
                        issueId: issueData["_id"],
                        RiderDetails: issueData.RiderDetails,
                        status: issueData.status,
                        occurrenceTime: issueData.occurrenceTime
                    }
                    
                });

                var responseData = {
                    activeIssues: activeIssues,
                    engagedIssues: engagedIssues
                };
                responseCallback(responseData);

            }
        }
    );
}

exports.acknowledgeRequest = acknowledgeRequest;
exports.getRiderDetails = getRiderDetails;

exports.getDriverLocation = getDriverLocation;
exports.updateDriverLocation = updateDriverLocation;
exports.getNearestIssues = getNearestIssues;