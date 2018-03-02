var splunkjs = require("splunk-sdk");
let _utils = require("../utils/utils.js");

module.exports = (function() {
  var connectionDetails = {
    username: "",
    password: "",
    scheme: "https",
    host: "",
    port: ""
  };

  /**
  * @description - Ports arguments to connectionDetails object
  * @param {object} options - arguments from command
  */ 
  var setConnectionDetails = function(options) {
    connectionDetails.username = options.username;
    connectionDetails.password = options.password;
    connectionDetails.host = options.host;
    connectionDetails.port = options.port;
  };

  /**
  * @description - Create splunk connection object
  * @description - Created splunk service object using connection object and returns same 
  * @param {object} options - arguments from command
  * @returns object - splunk connection object
  */
  return function(options) {
    setConnectionDetails(options);

    global.logger.debug({
      message: "Splunk connection details",
      connectionDetails: JSON.stringify(
        Object.assign({}, connectionDetails, { password: "********" })
      )
    });

    try {
      //Splunk service factory
      let service = new splunkjs.Service(connectionDetails);
      global.logger.info({ message: "Splunk service created" });
      return service;
    } catch (creationErr) {
      global.logger.error({
        message: " ❗  Splunk service creation error",
        creationErr
      });
      _utils.informUserAboutError();
      return null;
    }
  };
})();
