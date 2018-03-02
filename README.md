# splunk-search-cli
A simple command line interface to search splunk and display results in STDOUT CSV format. It is written in Node js. 

## To Run
Please follow the below steps for setting up the CLI

- Clone this repo into local machine
- `cd splunk-search-cli`
- `npm start`

Once the command line interface opens you will see the following screen

![Initial setup](img/cli-set-up.png)

## Commands

### help
Once the application is started with the above instructions `help` command will display all the available commands and its functionalities
```
splunk-search-cli$ help

  Commands:

    help [command...]       Provides help for a given command.
    exit                    Exits application.
    clear                   clears the screen
    search [options]        Queries splunk prints the results. Saves results to ./results-csv/ dir
    searchasync [options]   Asynchronously. queries splunk prints the results. Does NOT save results in file

splunk-search-cli$
```
------

### clear
`clear` command clears the screen 

```
splunk-search-cli$ help clear

  Usage: clear [options]

  clears the screen

  Options:

    --help  output usage information

splunk-search-cli$
```
------

### search 
- `search` command does a one shot search on the splunk server and prints the output at STDOUT in CSV format. 
- It fetches first 100 results
- It saves the results in the saves results to `./results-csv/` directory. 
- It saves the logs under `./debug-logs/` directory. Default log level is `info`. 
- This command can be executed in debug mode using the argument `-d` or `--debug` upon which this the log level will be set to debug 
- As this command fetches first 100 results, it is not recommended for larger search results. 

Please find the options and their descriptions below
```
splunk-search-cli$ help search

  Usage: search [options]

  Queries splunk prints the results. Saves results to ./results-csv/ dir

  Options:

    --help                     output usage information
    -d, --debug                Debug boolean. Sets log level to debug. Log files @ ./debug-logs/ dir
    -u, --username <username>  Splunk username.
    -p, --password <password>  Splunk password.
    -h, --host <host>          Splunk REST API URL.
    --port <port>              Splunk REST API port.
    --query                    Splunk search query

splunk-search-cli$
```

### searchasync
- `searchasync` command does asynchronously search on the splunk server and prints the output at STDOUT in CSV format. 
- It fetches all results 
- It does NOT save the results in the saves results to `./results-csv/` directory. 
- It saves the logs under `./debug-logs/` directory. Default log level is `info`. 
- This command can be executed in debug mode using the argument `-d` or `--debug` upon which this the log level will be set to debug 
- As this command fetches all the results, it is recommended for larger search results. 

Please find the options and their descriptions below
```
splunk-search-cli$ help searchasync

  Usage: searchasync [options]

  Asynchronously queries splunk prints the results. Does NOT save results in file

  Options:

    --help                     output usage information
    -d, --debug                Debug boolean. Sets log level to debug. Log files @ ./debug-logs/ dir
    -u, --username <username>  Splunk username.
    -p, --password <password>  Splunk password.
    -h, --host <host>          Splunk REST API URL.
    --port <port>              Splunk REST API port.
    --query                    Splunk search query

splunk-search-cli$
```
## Tests
Unit tests are written in MochaJS. Below are the results for the test run. Unit tests can be run using `npm test` command

![Initial setup](img/unit-test.png)

## Version Dependencies
- nodejs : v7.10.0 (or newer)
- npm : 5.6.0 (or newer)
