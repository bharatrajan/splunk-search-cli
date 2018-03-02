let vorpal = require('vorpal')();
let searchCommand = require('./search-command/index.js');

process.env.NODE_ENV = 'production';

vorpal.command('search', 'Queries splunk prints the results. Keeps results to ./results-csv/ dir')
      .option('-d, --debug', 'Debug boolean. Sets log level to debug. Log files @ ./debug-logs/ dir')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('--query', 'Splunk search query')
      .parse(searchCommand.parser)
      .action(searchCommand.action);      

vorpal
  .delimiter('splunk-search-cli$')
  .show();