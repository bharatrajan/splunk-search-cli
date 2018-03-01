let commander = require('commander');
let vorpal = require('vorpal')();
let splunkjs = require('splunk-sdk');
let Spinner = require('cli-spinner').Spinner;
let json2csv = require('json2csv').parse;
 
let isOptionValid = require('./utils/sanitizeOptions.js');
let logMsg = require('./utils/messages.js');
let _utils = require('./utils/utils.js');
let searchResultsParser = require('./utils/resultParser.js');

let getSplunkService = require('./splunkUtils/getSplunkService.js');
let jobSearcher = require('./splunkUtils/doJobSearch.js');

//jobs --username admin --password P@ssw0rd --host localhost --port 8089 -d

vorpal.command('jobs', 'Gets you all the job')
      .option('-d, --debug', 'Debug boolean.')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .action(function(args, callback) {
        
        global.debug = args.options.debug;

        if(isOptionValid.jobs(args.options, this)){
            let splunkService = getSplunkService(args.options);
            if(splunkService)
                jobSearcher(splunkService);
        }else{
            this.log(logMsg.INVALID_OPTION_ERROR_MSG);
        }

        callback();      

      });




vorpal.command('search', 'Queries splunk')
      .option('-d, --debug', 'Debug boolean.')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('-q, --query <query>', 'Splunk search query. Should start like \'search ...\'')
      .action(function(args, callback) {
        global.debug = args.options.debug;
        

        if(isOptionValid.query(args.options, this)){
            let {query} = args.options;

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
                    if (!err){
                        searchSpinner.stop(true);

                        let parseSpinner = _utils.showSpinner('PARSING..');
                        
                        let fields = searchResultsParser.getFields(resp);
                        let results = searchResultsParser.getData(resp);


                        try {
                          const csv = json2csv(results, {fields});
                          parseSpinner.stop(true);
                          console.log(csv);
                          
                        } catch (parseErr) {
                          console.log("parseErr: ", parseErr);
                          parseSpinner.stop(true);                          
                        }

                    }else{
                        this.log("err: ", err);                        
                    } 
                });            
            }


        }else{
            this.log(logMsg.INVALID_OPTION_ERROR_MSG);
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