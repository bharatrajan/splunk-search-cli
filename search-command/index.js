let vorpal = require("vorpal")();
let _ = require("lodash");
let fs = require("fs");
let converter = require("json-2-csv");
let Spinner = require("cli-spinner").Spinner;
var splunkjs = require("splunk-sdk");

let getSplunkService = require("../splunkUtils/getSplunkService.js");

let searchResultsParser = require("../utils/resultParser.js");
let isOptionValid = require("../utils/sanitizeOptions.js");
let _utils = require("../utils/utils.js");

module.exports = {
  /**
  * @description - Handler for searchasync command
  * @description - Saves logs under /debug-log dir
  * @param {object} args - contains command line args
  * @param {function} callback - to be called to keep the CLI session alive
  * @returns null
  */  
  asyncAction: function(args, callback) {
    _utils.clearScreen();//clears screen
    _utils.setLogger(args.options.debug);//setup logger instance

    global.logger.info({
      message: "Incoming options",
      options: JSON.stringify(
        Object.assign({}, args.options, {
          password: "********",
          query: global.searchQuery
        })
      )
    });

    //Validates the incoming args
    if (isOptionValid.jobs(args.options, this)) {
      let query = global.searchQuery;
      let splunkService = getSplunkService(args.options);//From factory
      let searchParams = {
        exec_mode: "blocking"
      };

      global.logger.debug({
        message: "QUERY before making splunk call",
        query
      });

      if (splunkService) {
        //Displays spinner while search job is created
        let searchSpinner = _utils.showSpinner("SEARCHING..");
        searchSpinner.start();

        //Created a search job and calls callback
        splunkService.search(query, searchParams, function(err, job) {
          
          //Stop displaying spinner
          searchSpinner.stop(true);
          
          if (err) {//Error handling
            global.logger.error({
              message: " ❗  Splunk search error",
              error: err
            });
            _utils.informUserAboutError();
          } else {
            //Fetch to pull data out of the job
            job.fetch(function(err) {
              if (err) {//error handling
                global.logger.error({
                  message: " ❗  Splunk job fetch error",
                  error: err
                });
                _utils.informUserAboutError();
              } else {

                global.logger.info({ message: "Splunk search :: SUCCESS" });

                var resultCount = job.properties().resultCount; // Number of results this job returned
                var myOffset = 0; // Start at result 0
                var myCount = 10; // Get sets of 10 results at a time

                //Async. way to poll data from the job
                splunkjs.Async.whilst(
                  //offset setter
                  function() {
                    return myOffset < resultCount;
                  },
                  //Result parser
                  function(done) {
                    job.results({ count: myCount, offset: myOffset }, function(
                      err,
                      resultFromSplunk
                    ) {
                      //Displaying result in csv
                      let fields = resultFromSplunk.fields;
                      let results = resultFromSplunk.rows;

                      //Printing Header - singleton
                      if (!global.headerPrintedForAsyncJob) {
                        var newFields = fields.map(function(item) {
                          var el = JSON.stringify(item);
                          el = el.trim();

                          if (el.indexOf('"') != 0) el = '"' + el;
                          if (el.lastIndexOf('"') != el.length - 1)
                            el = el + '"';
                          return el;
                        });
                        console.log(newFields.join(","));
                      }

                      //Printing results as CSV format 
                      try {
                        results.forEach(function(row) {
                          var newResults = row.map(function(item) {
                            var el = JSON.stringify(item);
                            el = el.trim();

                            if (el.indexOf('"') != 0) el = '"' + el;
                            if (el.lastIndexOf('"') != el.length - 1)
                              el = el + '"';
                            return el;
                          });
                          console.log(newResults.join(","));
                        });
                      } catch (e) {}

                      global.headerPrintedForAsyncJob = true;
                      myOffset = myOffset + myCount;
                      done();
                    });
                  },
                  //Error callback
                  function(err) {
                    if (err) {
                      global.logger.error({
                        message: " ❗  Splunk Async whilst error",
                        error: err
                      });
                      _utils.informUserAboutError();
                    }
                  }
                );
              }
            });
          }
        });
      }
    } else {
      _utils.informUserAboutError();
    }

    callback();
  },


  /**
  * @description - Handler for search command
  * @description - Saves results under /results-csv dir
  * @description - Saves logs under /debug-log dir
  * @param {object} args - contains command line args
  * @param {function} callback - to be called to keep the CLI session alive
  * @returns null
  */  
  action: function(args, callback) {
    _utils.clearScreen();//clears screen
    _utils.setLogger(args.options.debug);//Initializing logger

    global.logger.info({
      message: "Incoming options",
      options: JSON.stringify(
        Object.assign({}, args.options, {
          password: "********",
          query: global.searchQuery
        })
      )
    });

    //Validating args from CLI
    if (isOptionValid.jobs(args.options, this)) {
      let query = global.searchQuery;
      let splunkService = getSplunkService(args.options);//Splunk service from factory
      let searchParams = {
        output_mode: "CSV",
        earliest_time: "",
        latest_time: ""
      };

      global.logger.debug({
        message: "QUERY before making splunk call",
        query
      });

      if (splunkService) {
        //Display spinner
        let searchSpinner = _utils.showSpinner("SEARCHING..");
        searchSpinner.start();

        //Start one shot search
        splunkService.oneshotSearch(query, searchParams, function(err, resp) {
          //Stop displaying spinner
          searchSpinner.stop(true);

          if (err) {//Error handling
            global.logger.error({
              message: " ❗  Splunk search error",
              error: err
            });
            _utils.informUserAboutError();
          } else {//Success handler
            global.logger.info({ message: "Splunk search :: SUCCESS" });

            let fields = searchResultsParser.getFields(resp);
            let results = searchResultsParser.getData(resp);
            let json2csvOption = _utils.getJSON2CSVOptions(fields, true);

            //Converting results into CSV format
            converter.json2csv(
              results,
              function(csvContentErr, csvContent) {
                if (!csvContentErr) {
                  //Saving CSV format to fileName
                  let fileName = _utils.getCSVFileName();
                  fs.writeFile(fileName, csvContent, "utf8", function(fsErr) {
                    if (fsErr) {
                      global.logger.error({
                        message: " ❗  File system error",
                        fsErr
                      });
                      _utils.informUserAboutError();
                    } else {
                      global.logger.info({
                        message: "result file created",
                        fileName
                      });
                    }
                  });

                  //Printing result
                  _utils.clearScreen();
                  console.log("\n");
                  console.log("\n");
                  if (!_.isEmpty(results)) console.log(csvContent);
                  else
                    console.log(
                      "No results found for query : \n",
                      global.searchQuery
                    );
                  console.log("\n");
                  console.log("\n");
                } else {
                  global.logger.error({
                    message: " ❗  JSON -> CSV convertion error",
                    csvContentErr
                  });
                  _utils.informUserAboutError();
                }
              },
              json2csvOption
            );
          }
        });
      }
    } else {
      _utils.informUserAboutError();
    }
    callback();
  },

  /**
  * @description - Runs before search handler for all search commands
  * @description - Massages the input CLI args . Adds 'search ' if user forgot to type
  * @description - 'search ' is needed as per splunk SDK in all search queries
  * @param {string} command - command from CLI
  * @param {string} args - arguments from CLI
  * @returns string - command unaltered
  */    
  parser: function(command, args) {

    try {
      //Scrapping individual arguments
      let queryStr = "",
        argsSplitArr = args.split("-");
        argsSplitArrTrimmed = argsSplitArr.filter(function(item) {
        return !_.isEmpty(item);
      });

      //Searching for query argument
      for (let i = 0; i <= argsSplitArrTrimmed.length; i++) {
        argsSplitArrTrimmed[i] = argsSplitArrTrimmed[i].trim();
        if (
          argsSplitArrTrimmed[i].indexOf("query ") == 0 ||
          argsSplitArrTrimmed[i].indexOf("q ") == 0
        ) {
          queryStr = argsSplitArrTrimmed[i];
          break;
        }
      }

      //Scrapping query argument      
      let qStrSplit = queryStr.split("query ");
      qStrSplit.shift();

      let normalizedQuery = qStrSplit[0];
      normalizedQuery = normalizedQuery.slice(
        1,
        normalizedQuery.lastIndexOf('"')
      );

      //Adding "Search " string if needed
      if (normalizedQuery.indexOf("search ") == -1)
        normalizedQuery = "search " + normalizedQuery;

      //Setting query to global scope
      global.searchQuery = normalizedQuery;
    } catch (ignore) {}

    return command;
  }
};

/*
search -u admin -p P@ssw0rd -h localhost --port 8089 --query "" -d

Failed SSH 
search -u admin -p P@ssw0rd -h localhost --port 8089 --query "ssh* error OR *fail* OR severe |rex field=_raw "(?<val_ignore_1>.*)\ for (?<raw_user>.*)\ from (?<IP>.*)\ port (?<val_ignore_2>.*)" | rex field=IP "27\.0\.0\.(?<range>\d{1,3})" | where range >=0 AND range<=8 | eval User=replace(raw_user, "invalid user ", "") | table User IP" -d

Google Bot
search -u admin --password P@ssw0rd -h localhost --port 8089 --query "sourcetype=access_* useragent=*google* AND useragent=*Bot* | dedup file | table uri_path file | rename file as File | rename uri_path AS Webpages" -d

50X Error
search -u admin -p P@ssw0rd -h localhost --port 8089 --query "sourcetype=access* status=50*| table req_time clientip uri_domain uri | rename req_time as Timestamp, uri AS URI, uri_domain AS Domain, clientip AS "Client IP"" -d

Other tests
search -u admin -p P@ssw0rd -h localhost --port 8089 --query "ssh* error OR *fail* OR severe | head 500 |rex field=_raw "(?<val_ignore_1>.*)\ for (?<raw_user>.*)\ from (?<IP>.*)\ port (?<val_ignore_2>.*)" | eval User=replace(raw_user, "invalid user ", "") | table User IP" -d
searchasync -u admin -p P@ssw0rd -h localhost --port 8089 --query "ssh* error OR *fail* OR severe | rex field=_raw "(?<val_ignore_1>.*)\ for (?<raw_user>.*)\ from (?<IP>.*)\ port (?<val_ignore_2>.*)" | eval User=replace(raw_user, "invalid user ", "") | table User IP" -d
searchasync -u admin -p P@ssw0rd -h localhost --port 8089 --query "ssh* error OR *fail* OR severe" -d
searchasync -u admin -p P@ssw0rd -h localhost --port 8089 --query "ssh* error OR *fail* OR severe | head 500 | table _raw" -d
*/
