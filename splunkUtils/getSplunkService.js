var splunkjs = require('splunk-sdk');

module.exports = (function(){
    var connectionDetails = { 
        username: "",
        password: "",
        scheme:"https",
        host:"",
        port:""
    };

    var setConnectionDetails = function(options){
        connectionDetails.username = options.username;
        connectionDetails.password = options.password;
        connectionDetails.host = options.host;
        connectionDetails.port = options.port;
    };

    return function(options){
        setConnectionDetails(options);
        return new splunkjs.Service(connectionDetails);
    }
})();