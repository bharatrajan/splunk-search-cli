let vorpal = require('vorpal')();
let searchCommand = require('./search-command/index.js');
let _utils = require('./utils/utils.js');

process.env.NODE_ENV = 'production';

vorpal.command('clear', 'clears the screen')
      .action(function(args, cb){
        _utils.clearScreen();
        cb();
      })

vorpal.command('search', 'Queries splunk prints the results. Saves results to ./results-csv/ dir')
      .option('-d, --debug', 'Debug boolean. Sets log level to debug. Log files @ ./debug-logs/ dir')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('--query', 'Splunk search query')
      .parse(searchCommand.parser)
      .action(searchCommand.action); 
      
vorpal.command('searchasync', 'Asynchronously. queries splunk prints the results. Does NOT save results in file')
      .option('-d, --debug', 'Debug boolean. Sets log level to debug. Log files @ ./debug-logs/ dir')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('--query', 'Splunk search query')
      .parse(searchCommand.parser)
      .action(searchCommand.asyncAction);       

vorpal.delimiter('splunk-search-cli$')
      .show();