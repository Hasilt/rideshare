
var riderApiHandlers = require('../route-handlers/rider-api-handlers');

function initialize(expressInstance, io, socket) {
    var app = expressInstance,
        debug = require('debug')('rideshare:citizen-api');

    app.post('/location/driver', function(req, res) { //Fetches nearby fas
        debug('request to /location/driver');
        riderApiHandlers.getNearestDrivers(req, function(responseData) {
            res.json(responseData);
        });
    });





//

    //

    app.post('/help/request', function(req, res) { 
        debug('request to /request/help');
        riderApiHandlers.requestCop(req, function(riderdata, driverdata) {
            res.json(driverdata);
            debug(riderdata);

            for (var i = 0; i < driverdata.driverdata.length; i++) {
                io.sockets.in(driverdata.driverdata[i].userId).emit('waiting-for-requests', riderdata);
                //new
            }
        });
    });



    app.post('/help/acknowledge', function(req, res) { //for ending the issue / matter is over
        debug('request to /help/acknowledge');
        riderApiHandlers.endIssue(req, function(responseData) {
            res.json(responseData);
        });});

    app.post('/help/ratings', function(req, res) {
        debug('request to /help/ratings');
        riderApiHandlers.rateCop(req, function(responseData) {
            res.json(responseData);
        }); });

    app.post('/rider/location/update', function(req, res) {
        debug('request to /crider/location/update');
        debug(req.session.user);
        if (req.session.user) {
            riderApiHandlers.updateRiderLocation(req, function(responseData) {
                res.json(responseData);
            });
        }



    });




    app.get('/issues', function(req, res) { //to get list of issues
        riderApiHandlers.getIssues(req, function(responseData) {
            res.json(responseData);
        });
    });

}

exports.initialize = initialize;