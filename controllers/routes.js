var authApi = require('./routes/auth-api');



var riderApi = require('./routes/rider-api');
var driverApi = require('./routes/driver-api');




function initialize(expressInstance, io, socket) 


{

    authApi.initialize(expressInstance, io, socket);
    riderApi.initialize(expressInstance, io, socket);
    //citi
    driverApi.initialize(expressInstance, io, socket);
}





exports.initialize = initialize;