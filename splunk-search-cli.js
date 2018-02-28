var commander = require('commander');
var vorpal = require('vorpal')();
var splunkjs = require('splunk-sdk');

var isOptionValid = require('./utils/sanitizeOptions.js');
var logMsg = require('./utils/messages.js');
var getSplunkService = require('./splunkUtils/getSplunkService.js');
var jobSearcher = require('./splunkUtils/doJobSearch.js');


//jobs --username admin --password P@ssw0rd --host localhost --port 8089 -d

vorpal.command('jobs', 'Gets you all the job')
      .option('-d, --debug', 'Debug boolean.')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .action(function(args, callback) {
        
        let debug = args.options.debug;

        if(isOptionValid.jobs(args.options, this)){
            let splunkService = getSplunkService(args.options);
            if(splunkService)
                jobSearcher(splunkService);
        }else{
            this.log(logMsg.INVALID_OPTION_ERROR_MSG);
        }

        callback();      

      });

/*
search --username admin --password P@ssw0rd --host localhost --port 8089 --query "search index=_internal | head 20" -d
search --username admin --password P@ssw0rd --host localhost --port 8089 --query "search referer_domain=*google* | head 20" -d
*/
vorpal.command('search', 'Queries splunk')
      .option('-d, --debug', 'Debug boolean.')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('-q, --query <query>', 'Splunk search query. Should start like \'search ...\'')
      .action(function(args, callback) {
        

        if(isOptionValid.query(args.options, this)){
            let {query, debug} = args.options;

            let splunkService = getSplunkService(args.options);
            let params = {
                output_mode : "CSV"
            }
            let ns = {
                owner : '-'
            }

            if(splunkService){
                this.log(logMsg.LOADING);
                splunkService.oneshotSearch(query, params, ns, function(err, results) {
                    if (err)
                        console.log("err: ", err);
                    else 
                        console.log(JSON.stringify(results));
                });            
            }


        }else{
            this.log(logMsg.INVALID_OPTION_ERROR_MSG);
        }

        callback();     
        
      });      


vorpal
  .delimiter('splunk-search-cli$')
  .show();