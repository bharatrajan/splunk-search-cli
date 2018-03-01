let Spinner = require('cli-spinner').Spinner;

module.exports = {
    showSpinner : function(str){
        let spinner = new Spinner(str + '%s');
            spinner.setSpinnerString('|/-\\');    
        return spinner;
    },

    getJSON2CSVOptions : function(fields){
        return {
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
    },

    getCSVFileName: function(){
        let fileName = "./results-csv/",
            ts = new Date().getTime();
        return fileName + ts + ".csv"
    }

}