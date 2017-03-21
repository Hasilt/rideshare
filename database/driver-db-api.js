
var configRedis = require('../configs/db-configs/config-redis');
var configMongo = require('../configs/db-configs/config-mongodb');

var ObjectID = require('mongodb').ObjectID;

var redisClient = configRedis.redisClient(),
    mongoDBClient = configMongo.mongoClientDB(),
    debug = require('debug')('rideshare:pol-db-api');

function updateDriverLocation(reqObj, callback) {
    mongoDBClient.collection("driverData").ensureIndex({
        "location": "2dsphere"
    }, function() {
        mongoDBClient.collection("driverData").update({
            userId: reqObj.userId
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
                    message: 'Execute failed in updateDriverLocation'
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

function checkIssueStatus(issueId, callback) {
    mongoDBClient.collection("issuesData").findOne({
        _id: new ObjectID(issueId)
    }, function(err, results) {
        if (err) {
            callback(err);
        } else {
            if (results) {
                var resultData = {
                    issueId: issueId,
                    status: results.status
                }
                callback(null, resultData);
            }

        }
    });
}





function updateIssueStatus(statusData, policeDetails, callback) {
    mongoDBClient.collection("issuesData").ensureIndex({
        "issuesData.location": "2dsphere"
    }, function(){
        mongoDBClient.collection("issuesData").update({
 
             _id: new ObjectID(statusData.issueId)
        }, {
            $set: {
                policeDetails: policeDetails,
                status: 'engaged',
                responseTime: statusData.responseTime
            }
        }, function(err, results) {
            if (err) {
                callback(err);
            } else {
                var resultData = {
                    issueId: statusData.issueId,
                    status: 'engaged'
                }
                callback(null, resultData);
            }
        });
    });
}




function getDriverLocation(userId, callback) {
    mongoDBClient.collection("driverData").findOne({
        "userId": userId
    }, function(err, results) {
        if (err) {
            callback(err);
        } else {
            if (results) {
                console.log(results);
                callback({location: results.location});
            }

        }
    });
}



                function getNearestIssues(coordinates, callback){
                        debug(coordinates);
                    mongoDBClient.collection("issuesData").ensureIndex({
                        "citizenDetails.location": "2dsphere"



                    }, function() {
                        mongoDBClient.collection("issuesData").find({
                            "citizenDetails.location": {
                                    $near: {
                                        $geometry: {
                                            type: "Point",
                                            coordinates: coordinates
                                        },
                                        $maxDistance: 3000
                    }
            },
            "status": "active"
        }).toArray(function(err, results) {
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });
    });
}

        function getIssuesofDriver(userId, callback){
        mongoDBClient.collection("issuesData").find({
            "policeDetails.userId": userId,
            "status": "engaged"
    }).toArray(function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
}


exports.updateDriverLocation = updateDriverLocation;
exports.checkIssueStatus = checkIssueStatus;
exports.updateIssueStatus = updateIssueStatus;
exports.getDriverLocation = getDriverLocation;
exports.getNearestIssues = getNearestIssues;
exports.getIssuesofDriver = getIssuesofDriver;