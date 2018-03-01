let Spinner = require('cli-spinner').Spinner;
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

module.exports = {
    showSpinner : function(str){
        let spinner = new Spinner(str + '%s');
            spinner.setSpinnerString('|/-\\');    
        return spinner;
    },

    getJSON2CSVOptions : function(fields){
        let options = {
            delimiter : {
                wrap  : '"', // Double Quote (") character
                field : ',', // Comma field delimiter
                array : ';', // Semicolon array value delimiter
                eol   : '\n' // Newline delimiter
            },
            prependHeader    : true,
            sortHeader       : false,
            trimHeaderValues : true,
            trimFieldValues  :  true,
            keys             : fields
        }
        global.logger.debug({
            message: 'JSON -> CSV Options',
            op: "utils.getJSON2CSVOptions",
            options
        })              
        return options
    },

    getCSVFileName: function(){
        let fileName = "./results-csv/",
            ts = new Date().getTime();
        return fileName + ts + ".csv"
    },

    getLogFileName: function(){
        let fileName = "./debug-logs/",
            ts = new Date().getTime();
        return fileName + ts + ".log"
    },    

    setLogger: function(isDebug){
        global.debugFile = this.getLogFileName();
        global.logger = winston.createLogger({
            level: isDebug ? 'debug' : 'info',
            format: combine(
                timestamp(),
                prettyPrint()
            ),
            transports: [
              new winston.transports.File({ filename: global.debugFile })
            ]
          });
          
          if (process.env.NODE_ENV !== 'production') {
            logger.add(new winston.transports.Console({
              format: winston.format.simple()
            }));
          }
    },

    informUserAboutError: function(){
        console.log("Something went wrong. Please see logs at " + global.debugFile);
    }

}