let vorpal = require("vorpal")();
let Spinner = require("cli-spinner").Spinner;
const winston = require("winston");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, prettyPrint } = format;

module.exports = {
  /**
  * @description - Creates and returns a spinner using cli-spinner
  * @param {string} str - String that prepends spinner ("Loading ...")
  * @returns cli-spinner object
  */    
  showSpinner: function(str) {
    let spinner = new Spinner(str + "%s");
    spinner.setSpinnerString("|/-\\");
    return spinner;
  },

  /**
  * @description - Creates JSON->CSV configuration
  * @param {array} fields - header for the csv
  * @param {boolesn} prependHeader - true will add header to the csv
  * @returns config object
  */      
  getJSON2CSVOptions: function(fields, prependHeader) {
    let options = {
      delimiter: {
        wrap: '"', // Double Quote (") character
        field: ",", // Comma field delimiter
        array: ";", // Semicolon array value delimiter
        eol: "\n" // Newline delimiter
      },
      prependHeader: prependHeader,
      sortHeader: false,
      trimHeaderValues: true,
      trimFieldValues: true,
      keys: fields
    };
    global.logger.debug({
      message: "JSON -> CSV Options",
      op: "utils.getJSON2CSVOptions",
      options
    });
    return options;
  },

  /**
  * @description - Generates a csv file name with timestamp
  * @description - Format : ./results-csv/153889559.csv
  * @returns string : file name 
  */      
  getCSVFileName: function() {
    let fileName = "./results-csv/",
      ts = new Date().getTime();
    return fileName + ts + ".csv";
  },

  /**
  * @description - Generates a log file name with timestamp
  * @description - Format : ./debug-logs/153889559.log
  * @returns string : file name 
  */    
  getLogFileName: function() {
    let fileName = "./debug-logs/",
      ts = new Date().getTime();
    return fileName + ts + ".log";
  },

  /**
  * @description - Creates & sets winston-logger object in the global scope
  * @description - Sets log file name to global scope too
  */      
  setLogger: function(isDebug) {
    global.debugFile = this.getLogFileName();
    global.logger = winston.createLogger({
      level: isDebug ? "debug" : "info",
      format: combine(timestamp(), prettyPrint()),
      transports: [new winston.transports.File({ filename: global.debugFile })]
    });

    if (process.env.NODE_ENV !== "production") {
      logger.add(
        new winston.transports.Console({
          format: winston.format.simple()
        })
      );
    }
  },

  /**
  * @description - Prints blank and clears the CLI screen 
  */     
  clearScreen: function(callback) {
    try {
      process.stdout.write("\u001B[2J\u001B[0;0f");
    } catch (ignoreErr) {}
    if (typeof callback == "function") callback();
  },

  /**
  * @description - Generic error handler that displays 
  * @description - debug file name and options for failed command
  */ 
  informUserAboutError: function() {
    console.log("");
    console.log(
      " ❗ SOMETHING WENT WRONG. Please see logs at " + global.debugFile
    );
    console.log("");
    console.log("");
    console.log("");

    console.log("");
    console.log("    Options:");
    console.log("");
    console.log("      --help                     output usage information");
    console.log(
      "      -d, --debug                Debug boolean. Sets log level to debug. Log files @ ./debug-logs/ dir"
    );
    console.log("      -u, --username <username>  Splunk username.");
    console.log("      -p, --password <password>  Splunk password.");
    console.log("      -h, --host <host>          Splunk REST API URL.");
    console.log("      --port <port>              Splunk REST API port.");
    console.log("      --query                    Splunk search query");
    console.log("");
  }
};
