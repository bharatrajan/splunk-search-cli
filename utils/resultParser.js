let _ = require("lodash");

module.exports = {
  getFields: function(result) {
    let fields = [];
    if (
      !_.isEmpty(result) &&
      !_.isEmpty(result.fields) &&
      _.isArray(result.fields)
    ) {
      result.fields.forEach(function(item) {
        if ("_si" != item.name) fields.push(item.name);
      });
    }
    let indexOfRaw = fields.indexOf("_raw");
    let lastIndex = fields.length - 1;

    if (indexOfRaw != -1) {
      var lastItem = fields[lastIndex];
      fields[lastIndex] = "_raw";
      fields[indexOfRaw] = lastItem;
    }
    global.logger.debug({
      message: "fields",
      op: "resultParser.getFields",
      fields
    });
    return fields;
  },

  getData: function(resp) {
    let results = [];
    if (
      !_.isEmpty(resp) &&
      !_.isEmpty(resp.results) &&
      _.isArray(resp.results)
    ) {
      results = resp.results;
    }
    global.logger.debug({
      message: "results",
      op: "resultParser.getData",
      results
    });
    return results;
  }
};
