let vorpal = require('vorpal')();
let _ = require('lodash');
let fs = require('fs');
let converter = require('json-2-csv');
let Spinner = require('cli-spinner').Spinner;


let getSplunkService = require('../splunkUtils/getSplunkService.js');

let searchResultsParser = require('../utils/resultParser.js');
let isOptionValid = require('../utils/sanitizeOptions.js');
let _utils = require('../utils/utils.js');

module.exports = {
    action : function(args, callback) {
        _utils.clearScreen();
        _utils.setLogger(args.options.debug);
    
        global.logger.info({
            message: 'Incoming options',
            options: JSON.stringify(Object.assign({}, args.options, {
                password : "********",
                query: global.searchQuery
            }))
        })
        
        if(isOptionValid.jobs(args.options, this)){
            let query = global.searchQuery;
            let splunkService = getSplunkService(args.options);
            let searchParams = {
                output_mode : "CSV",
                earliest_time: "",
                latest_time: ""
            };
    
            global.logger.debug({
                message: 'QUERY before making splunk call',
                query
            })

            if(splunkService){
                let searchSpinner = _utils.showSpinner('SEARCHING..');
                    searchSpinner.start();    
                                

                splunkService.oneshotSearch(query, searchParams, function(err, resp) {
                    searchSpinner.stop(true);
                    if (err){
                        global.logger.error({
                            message: ' ❗  Splunk search error',
                            error : err
                        })
                        _utils.informUserAboutError()                        
                    }else{
                        global.logger.info({message: 'Splunk search :: SUCCESS'});
    
                        let fields = searchResultsParser.getFields(resp);
                        let results = searchResultsParser.getData(resp);
                        let json2csvOption = _utils.getJSON2CSVOptions(fields);
    
                        converter.json2csv(results, function(csvContentErr, csvContent){
                            if(!csvContentErr){
                                let fileName = _utils.getCSVFileName();
                                fs.writeFile(fileName, csvContent, "utf8", function(fsErr){
                                    if (fsErr){
                                        global.logger.error({
                                            message: ' ❗  File system error',
                                            fsErr
                                        })
                                        _utils.informUserAboutError()
                                    }else{
                                        global.logger.info({
                                            message: 'result file created',
                                            fileName
                                        })
                                    }
                                });           

                                _utils.clearScreen();
                                console.log("\n");
                                console.log("\n");
                                if(!_.isEmpty(results))
                                    console.log(csvContent);
                                else
                                    console.log("No results found for query : \n", global.searchQuery);
                                console.log("\n");
                                console.log("\n");

                            }else{
                                global.logger.error({
                                    message: ' ❗  JSON -> CSV convertion error',
                                    csvContentErr
                                })
                                _utils.informUserAboutError()       
                            }
                        }, json2csvOption)
                    } 
                });            
            }
        }else{
            _utils.informUserAboutError()       
        }
    
        callback();     
        
      },
    
    parser : function(command, args){
        try{
            let queryStr = "",
            argsSplitArr = args.split('-');
            argsSplitArrTrimmed = argsSplitArr.filter(function(item){ return !_.isEmpty(item) })
    
            for(let i = 0; i<=argsSplitArrTrimmed.length; i++){
                argsSplitArrTrimmed[i] = argsSplitArrTrimmed[i].trim();
                if(argsSplitArrTrimmed[i].indexOf("query ") == 0 || argsSplitArrTrimmed[i].indexOf("q ") == 0){
                    queryStr = argsSplitArrTrimmed[i];
                    break;
                }
            }
            
            let qStrSplit = queryStr.split('query ');
                qStrSplit.shift();
        
            let normalizedQuery = qStrSplit[0];
                normalizedQuery = normalizedQuery.slice(1, normalizedQuery.lastIndexOf('"'))
        
            if(normalizedQuery.indexOf("search ") == -1)
               normalizedQuery = "search " + normalizedQuery
        
            global.searchQuery = normalizedQuery;   
        }catch(ignore){}
    
        return command;
    }
}

/*
search -u admin -p P@ssw0rd -h localhost --port 8089 --query "" -d

Failed SSH 
search -u admin -p P@ssw0rd -h localhost --port 8089 --query "ssh* error OR *fail* OR severe |rex field=_raw "(?<val_ignore_1>.*)\ for (?<raw_user>.*)\ from (?<IP>.*)\ port (?<val_ignore_2>.*)" | rex field=IP "27\.0\.0\.(?<range>\d{1,3})" | where range >=0 AND range<=8 | eval User=replace(raw_user, "invalid user ", "") | table User IP" -d

Google Bot
search -u admin --password P@ssw0rd -h localhost --port 8089 --query "sourcetype=access_* useragent=*google* AND useragent=*Bot* | dedup file | table uri_path file | rename file as File | rename uri_path AS Webpages" -d

50X Error
search -u admin -p P@ssw0rd -h localhost --port 8089 --query "sourcetype=access* status=50*| table req_time clientip uri_domain uri | rename req_time as Timestamp, uri AS URI, uri_domain AS Domain, clientip AS "Client IP"" -d



search -u admin -p P@ssw0rd -h localhost --port 8089 --query "ssh* error OR *fail* OR severe |rex field=_raw "(?<val_ignore_1>.*)\ for (?<raw_user>.*)\ from (?<IP>.*)\ port (?<val_ignore_2>.*)" | rex field=IP "27\.0\.0\.(?<range>\d{1,3})" | where range >=0 AND range<=8 | eval User=replace(raw_user, "invalid user ", "") | table User IP" -d

*/