
var driverApiHandlers = require('../route-handlers/driver-api-handlers');

function initialize(expressInstance, io, socket) {
    var app = expressInstance,
        debug = require('debug')('nammapolice:police-api');

    app.post('/request/acknowledge', function(req, res) {
        debug('request to /request/acknowledge');

        


        driverApiHandlers.acknowledgeRequest(req, function(riderData, driverData) {
            if (riderData.RiderDetails) {
                io.sockets.in(riderData.RiderDetails.userId).emit('waiting-for-help', driverData);
                
                res.json(riderData);
            } else if (riderData.status) {
                res.json(riderData);
            }

        });
    });

    app.get('/location/rider/:riderId', function(req, res) {
        debug('Inside /location');
        responseData = {
            greeting: req.params.riderId
        }
        res.json(responseData);

    });

    app.post('/rider/ratings', function(req, res) {
        debug('request to /rider/ratings');
        driverApiHandlers.rateCitizen(req, function(responseData) {
            res.json(responseData);
        });
    });

    app.post('/driver/location/update', function(req, res) {
        debug('request to /driver/location/update');
        driverApiHandlers.updatePoliceLocation(req, function(responseData) {
            res.json(responseData);
        });
    });

    app.get('/location/driver/:userId', function(req, res) { //to get cop's location
        debug('Inside /location/driver/:userId');
        driverApiHandlers.getCopLocation(req, function(responseData) {
            res.json(responseData);
        });
    });

    app.get('/driver/issues', function(req, res){
        driverApiHandlers.getNearestIssues(req, function(responseData) {
            res.json(responseData);
        });
    });
}

exports.initialize = initialize;