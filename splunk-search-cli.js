let vorpal = require('vorpal')();
let searchCommand = require('./search-command/index.js');

process.env.NODE_ENV = 'production';

vorpal.command('search', 'Queries splunk')
      .option('-d, --debug', 'Debug boolean. Sets log level to debug. Log files @ debug-logs/')
      .option('-u, --username <username>', 'Splunk username.')
      .option('-p, --password <password>', 'Splunk password.')
      .option('-h, --host <host>', 'Splunk REST API URL.')
      .option('--port <port>', 'Splunk REST API port.')
      .option('-q, --query <query>', 'Splunk search query. Should start like \'search ...\'')
      .parse(searchCommand.parser)
      .action(searchCommand.action);      
/*
search --username admin --password P@ssw0rd --host localhost --port 8089 --query "search index=_internal | head 20" -d
search --username admin --password P@ssw0rd --host localhost --port 8089 --query "search referer_domain=*google* | head 20" -d
search --username admin --password P@ssw0rd --host localhost --port 8089 --query "search referer=http://www.google.com AND clientip=91.205.189.15" -d
*/

vorpal
  .delimiter('splunk-search-cli$')
  .show();