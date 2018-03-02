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
                                console.log(csvContent);
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
        
        let qStrSplit = queryStr.split('"');
            qStrSplit.shift();
    
        let firstIdx = qStrSplit[0];
    
        if(firstIdx.indexOf("search ") != 0)
            firstIdx = "search " + firstIdx
    
        qStrSplit[0] = firstIdx;   
        global.searchQuery = qStrSplit.join(" ");    
    
        return command;
    }
}