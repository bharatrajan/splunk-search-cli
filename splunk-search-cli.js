let commander = require('commander');
let vorpal = require('vorpal')();
let splunkjs = require('splunk-sdk');
let Spinner = require('cli-spinner').Spinner;
let converter = require('json-2-csv');
let fs = require('fs');
 
let isOptionValid = require('./utils/sanitizeOptions.js');
let logMsg = require('./utils/messages.js');
let _utils = require('./utils/utils.js');
let searchResultsParser = require('./utils/resultParser.js');

let getSplunkService = require('./splunkUtils/getSplunkService.js');
let jobSearcher = require('./splunkUtils/doJobSearch.js');

process.env.NODE_ENV = 'production';

vorpal.command('search', 'Queries splunk')
      .option('-d, --debug', 'Debug boolean. Sets log level to debug. Log files @ debug-logs/')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('-q, --query <query>', 'Splunk search query. Should start like \'search ...\'')
      .action(function(args, callback) {

        _utils.setLogger(args.options.debug);

        global.logger.info({
            message: 'Incoming options',
            options: JSON.stringify(Object.assign({}, args.options, {password : "********"}))
        })
        
        if(isOptionValid.query(args.options, this)){
            let query = args.options.query;
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
        
      });      
/*
search --username admin --password P@ssw0rd --host localhost --port 8089 --query "search index=_internal | head 20" -d
search --username admin --password P@ssw0rd --host localhost --port 8089 --query "search referer_domain=*google* | head 20" -d
json2csv -i input.json -f _bkt,_cd,_indextime,_raw,_serial,_si,_sourcetype,_time,host,index,linecount,source,sourcetype,splunk_server -p
['_bkt','_cd','_indextime','_raw','_serial','_si','_sourcetype','_time','host','index','linecount','source','sourcetype','splunk_server']
*/

vorpal
  .delimiter('splunk-search-cli$')
  .show();