var commander = require('commander');
var vorpal = require('vorpal')();
var splunkjs = require('splunk-sdk');

var isOptionValid = require('./utils/sanitizeOptions.js');
var getSplunkService = require('./splunkUtils/getSplunkService.js');
var jobSearcher = require('./splunkUtils/doJobSearch.js');

//jobs --username admin --password P@ssw0rd --host localhost --port 8089 --query buttercup

vorpal.command('jobs', 'Gets you all the job')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .action(function(args, callback) {
        
        if(isOptionValid(args.options, this)){
            let splunkService = getSplunkService(args.options);
            jobSearcher(splunkService);

        }else{
            this.log("    ❗❗   INVALID OPTIONS    ❗❗   ")
        }

        vorpal
        .delimiter('splunk-search-cli$')
        .show();        

      });

vorpal.command('search', 'Gets you all the job')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('-q, --query <query>', 'Splunk search query.')
      .action(function(args, callback) {

        //search --username admin --password P@ssw0rd --host localhost --port 8089 --query 'search index=_internal | head 20'
        
        if(isOptionValid(args.options, this)){
            let query = args.options.query;
            this.log('query : ', query) 
            return;
            let splunkService = getSplunkService(args.options);

            splunkService.oneshotSearch(query, args.options, function(err, results) {
                if (err) {
                    console.log("err: ", err);
                }
                else { 
                    console.log(JSON.stringify(results));
                }
            });            

        }else{
            this.log("    ❗❗   INVALID OPTIONS    ❗❗   ")
        }

        vorpal
        .delimiter('splunk-search-cli$')
        .show();        
        
      });      


vorpal
  .delimiter('splunk-search-cli$')
  .show();