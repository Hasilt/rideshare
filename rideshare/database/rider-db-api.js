
var configRedis = require('../configs/db-configs/config-redis');
var configMongo = require('../configs/db-configs/config-mongodb');





	var db;
				var ObjectID = require('mongodb').ObjectID;

var redisClient = configRedis.redisClient(),
    mongoDBClient = configMongo.mongoClientDB(),
    debug = require('debug')('rideshare:citizen-db-api');

function getRiderDetails(reqObj, callback) {
    mongoDBClient.collection("riderData").findOne({
        phone: reqObj.userId
    }, function(err, results) {
        var resultData = {};
        if (err) {
            resultData = {
                error: err,
                message: 'Execute failed in getRiderDetails'
            };
            callback(resultData);
        } else {
            if (results) {
                resultData = {
                    userId: results.userId,
                    phone: results.phone,
                    displayName: results.displayName,
                    email: results.email,
                    password: results.password
                };
            } else {
                resultData = {
                    userId: null,
                    phone: null,
                    displayName: null,
                    email: null,
                    password: null
                };
            }
            callback(null, resultData);
        }
    });
}

function updateRiderLocation(reqObj, callback) {
    mongoDBClient.collection("riderData").ensureIndex({
        "location": "2dsphere"
    }, function() {
        mongoDBClient.collection("riderData").update({
            userId: reqObj.phone
        }, {
            $set: {
                location: {
                    type: "Point",
                    address: reqObj.address,
                    coordinates: reqObj.coordinates
                }
            }
        }, function(err, results) {
            var resultData = {};
            if (err) {
                resultData = {
                    error: err,
                    message: 'Execute failed in updateRiderLocation'
                };
                callback(resultData);
            } else {
                resultData = {
                    status: 'Location Updated',
                    docs: results
                };
                callback(null, resultData);
            }
        });
    });
}

function getNearestDrivers(coordinates, callback) {
    mongoDBClient.collection("driverData").ensureIndex({
        "location": "2dsphere"
    }, function() {
        mongoDBClient.collection("driverData").find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates
                    },
                    $maxDistance: 3000
                }
            }
        }).toArray(function(err, results) {
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });
    });
}

function registerNewIssue(reqObj, callback) {
    debug("inside registerNewIssue")
    mongoDBClient.collection("issuesData").ensureIndex({
        "RiderDetails.location": "2dsphere"
    }, function(){

        mongoDBClient.collection("issuesData").findOne({
            "RiderDetails.userId": reqObj.RiderDetails.userId,
            status: 'active' //active/engaged/closed
        }, function(err, resultsOne) {
            if (err) {
                callback(err);
            } else {
                if (resultsOne === null) {
                    mongoDBClient.collection("issuesData").ensureIndex({
                        "RiderDetails.location": "2dsphere"
                    }, function(){
                        mongoDBClient.collection("issuesData").insert({
                            occurrenceTime: reqObj.occurrenceTime,
                            RiderDetails: reqObj.RiderDetails,
                            //location: reqObj.RiderDetails.location,
                            status: 'active' //active/engaged/closed/
                        }, function(err, resultsTwo) {
                            if (err) {
                                callback(err);
                            } else {
                                reqObj.issueId = resultsTwo.insertedIds[0];
                                callback(null, reqObj);
                            }
                        });
                    });
                } else {
                    mongoDBClient.collection("issuesData").update({
                        "RiderDetails.userId": reqObj.RiderDetails.userId,
                        status: 'active'
                    }, {
                        $set: {
                            RiderDetails: reqObj.RiderDetails
                        }
                    }, function(err, resultsThree) {
                        if (err) {
                            callback(err);
                        } else {
                            reqObj.issueId = resultsOne["_id"];
                            callback(null, reqObj);
                        }
                    });
                }
            }
        });
    });
}

function endIssue(reqObj, callback) {
    mongoDBClient.collection("issuesData").update({
        _id: new ObjectID(reqObj.issueId)
    }, {
        $set: {
            status: 'resolved',
            endTime: reqObj.endTime
        }
    }, function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, 'resolved');
        }
    });
}

function getIssues(callback) {
    var collection = mongoDBClient.collection("issuesData");
    //Using stream to process potentially millions of records
    var stream = collection.find({}, {
        occurrenceTime: 1,
        responseTime: 1,
        endTime: 1,
        status: 1,
        "RiderDetails.location": 1,
        _id: 0
    }).stream();

    var issues = [];

    stream.on("data", function(item) {
        issues.push(item); //Might need to replace this with socket.io emit
    });
    stream.on('end', function() {
        var resultData = {
            issues: issues
        };
        callback(null, resultData);
    });
}




exports.getRiderDetails = getRiderDetails;

exports.updateRiderLocation = updateRiderLocation;

exports.getNearestDrivers = getNearestDrivers;
exports.registerNewIssue = registerNewIssue;
exports.endIssue = endIssue;
exports.getIssues = getIssues;