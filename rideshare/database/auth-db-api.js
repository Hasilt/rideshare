

var configRedis = require('../configs/db-configs/config-redis');
var configMongo = require('../configs/db-configs/config-mongodb');

	var ObjectID = require('mongodb').ObjectID;

	var redisClient = configRedis.redisClient(),
    mongoDBClient = configMongo.mongoClientDB(),
    debug = require('debug')('rideshare:account-db');

				function getRiderDetails(reqObj, callback) {


				    mongoDBClient.collection("riderData").findOne({
				        phone: reqObj.phone
				    }, function(err, results) {
				        var resultData = {};
				        if (err) {
				            resultData = {
				                error: err,
				                message: 'Execute failed '
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



//
// resultData = {/*
        //            userId: null,
      //              phone: null,
    //                displayName: null,
  //                  email: null,
          //          password: null,
//                    location: null

//







function getDriverDetails(reqObj, callback) {
    mongoDBClient.collection("driverData").findOne({
        userId: reqObj.userId
    }, function(err, results) {
        var resultData = {};
        if (err) {
            resultData = {
                error: err,
                message: 'Execute failed in getDriverDetails'
            };
            callback(resultData);
        } else {
            if (results) {
                resultData = {
                    userId: results.userId,
                    phone: results.phone,
                    displayName: results.displayName,
                    email: results.email,
                    password: results.password,
                    location: results.location
                };
            } else {
                resultData = {
                    userId: null,
                    phone: null,
                    displayName: null,
                    email: null,
                    password: null,
                    location: null
                };
            }
            callback(null, resultData);
        }
    });
}




function registerNewRider(reqObj, callback) {
    mongoDBClient.collection("riderData").insert({
        userId: reqObj.phone,
        displayName: reqObj.displayName,
        phone: reqObj.phone,
        email: reqObj.email,
        password: reqObj.password,
        earnedRatings: 5,
        totalRatings: 5
    }, function(err, results) {
        var resultData = {};
        if (err) {
            resultData = {
                error: err,
                message: 'Execute failed in registerNewRider'
            };
            callback(resultData);
        } else {
            resultData = {
                userId: reqObj.phone,
                displayName: reqObj.displayName
            }
            callback(null, resultData);
        }
    });
}




				function registerNewDriver(reqObj, callback) {
		    	mongoDBClient.collection("driverData").insert({

			        userId: reqObj.userId,
			        displayName: reqObj.displayName,

			        phone: reqObj.phone,
			        email: reqObj.email,


			        password: reqObj.password,
			        earnedRatings: 4,
			        totalRatings: 5,
			        status: 'available'
			    }, function(err, results) {
			        var resultData = {};
			        if (err) {
			            resultData = {
			                error: err,
			                message: 'Execute failed in registerNewDriver'
			            };
			            callback(resultData);
        } else {
            resultData = {
                userId: reqObj.userId,
                displayName: reqObj.displayName,
                phone: reqObj.phone
            }
            callback(null, resultData);
        }
    });
}




exports.getRiderDetails = getRiderDetails;
exports.getDriverDetails = getDriverDetails;
exports.registerNewRider = registerNewRider;
exports.registerNewDriver = registerNewDriver;