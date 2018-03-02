let vorpal = require('vorpal')();
let searchCommand = require('./search-command/index.js');

process.env.NODE_ENV = 'production';

vorpal.command('search', 'Queries splunk')
      .option('--debug', 'Debug boolean. Sets log level to debug. Log files @ debug-logs/')
      .option('--username <username>', 'Splunk username.')
      .option('--password <password>', 'Splunk password.')
      .option('--host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('--query', 'Splunk search query. Should start like \'search ...\'')
      .parse(searchCommand.parser)
      .action(searchCommand.action);      

vorpal
  .delimiter('splunk-search-cli$')
  .show();