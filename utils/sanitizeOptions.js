const QUERY_HEAD_STR = "search ";
const _ = require("lodash");

module.exports = {

  /**
  * @description - Validates the given arguments
  * @param {object} options - options from command
  * @returns boolean - wheather all options are vaild or not
  */
  jobs: function(options, ctx) {
    let logger = ctx || console;
    let username = options.username,
      password = options.password,
      host = options.host,
      port = options.port;

    if (_.isEmpty(username)) {
      global.logger.debug({
        message: "    ❗   Username is required",
        username
      });
    }

    if (_.isEmpty(password)) {
      global.logger.debug({
        message: "    ❗   Password is required"
      });
    }

    if (_.isEmpty(host)) {
      global.logger.debug({
        message: "    ❗   Host is required",
        host
      });
    }

    if (typeof port === "undefined") {
      global.logger.debug({
        message: "    ❗   Port is required",
        port: port
      });
    }

    return (
      typeof username !== "undefined" &&
      typeof password !== "undefined" &&
      typeof host !== "undefined" &&
      typeof port !== "undefined"
    );
  },

  /**
  * @description - Validates the query string
  * @param {object} options - options from command
  * @returns boolean - wheather all query string is vaild or not
  */  
  query: function(options, ctx) {
    let query = options.query,
      isQueryEmpty = _.isEmpty(query);

    if (isQueryEmpty) {
      global.logger.debug({
        message: "    ❗   Query is required",
        query
      });
    }

    return this.jobs(options, ctx) && !isQueryEmpty;
  }
};
